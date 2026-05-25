import time
from datetime import timedelta

import pytest
from fastapi import BackgroundTasks

from app.core.security import publisher, worker
from app.core.security.policies import (
    get_event_severity,
    should_aggregate,
    should_ignore,
    should_log_event,
    dedupe_redis_key,
)
from app.core.security.schemas import SecurityLogEvent
from app.core.security.events import SecurityEventType


class DummyRedis:
    def __init__(self):
        self.store = {}

    def incr(self, key):
        self.store[key] = self.store.get(key, 0) + 1
        return self.store[key]

    def expire(self, key, ttl):
        self.store[f"ttl:{key}"] = ttl
        return True

    def rpush(self, key, value):
        bucket = self.store.setdefault(key, [])
        bucket.append(value)
        return len(bucket)

    def lrange(self, key, start, end):
        bucket = self.store.get(key, [])
        return bucket[start:end + 1]

    def llen(self, key):
        return len(self.store.get(key, []))


def test_publish_security_event_success(monkeypatch):
    event = SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="WARN",
        module="auth",
        action="login",
        status="failure",
        metadata={"attempted_email": "foo@example.com"},
    )

    monkeypatch.setattr(publisher, "enqueue_security_event", lambda event: True)
    assert publisher.publish_security_event(event) is True


def test_publish_security_event_fallback_silent(monkeypatch):
    event = SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="WARN",
        module="auth",
        action="login",
        status="failure",
    )

    def bad_enqueue(event):
        raise RuntimeError("worker unavailable")

    monkeypatch.setattr(publisher, "enqueue_security_event", bad_enqueue)
    assert publisher.publish_security_event(event) is False


def test_worker_persist_retry(monkeypatch):
    calls = []

    def bad_create_audit_log(*args, **kwargs):
        calls.append("fail")
        if len(calls) == 1:
            raise RuntimeError("db busy")
        calls.append("ok")

    monkeypatch.setattr(worker.crud_audit, "create_audit_log", bad_create_audit_log)
    event = SecurityLogEvent(
        event_type=SecurityEventType.PASSWORD_CHANGED,
        severity="CRITICAL",
        module="auth",
        action="reset_password",
        status="success",
    )

    worker._persist(event)
    assert calls[-1] == "ok"
    assert len(calls) >= 2


def test_worker_tolerates_invalid_payload(monkeypatch):
    class BadEvent:
        pass

    monkeypatch.setattr(worker, "_process_event", lambda event: (_ for _ in ()).throw(TypeError("invalid event")))
    monkeypatch.setattr(worker, "_flush_due_buckets", lambda: None)
    assert worker._EVENT_QUEUE.empty()

    result = worker.enqueue_security_event(SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="WARN",
        module="auth",
        action="login",
        status="failure",
    ))
    assert result is True
    # worker should not raise while processing items in background loop


def test_worker_deduplicates_repeated_login_failures(monkeypatch):
    fake_redis = DummyRedis()
    monkeypatch.setattr(worker, "_get_redis_client", lambda: fake_redis)
    created = []

    def fake_create_audit_log(*args, **kwargs):
        created.append((args, kwargs))

    monkeypatch.setattr(worker.crud_audit, "create_audit_log", fake_create_audit_log)

    event = SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="WARN",
        module="auth",
        action="login",
        status="failure",
        user_id=123,
        ip="127.0.0.1",
        metadata={"attempted_email": "test@example.com"},
    )

    worker.reset_metrics()
    worker._process_event(event)
    worker._process_event(event)

    bucket_key = (event.event_type, event.user_id, event.ip, event.module, event.action)
    assert worker._ACTIVE_BUCKETS[bucket_key]["count"] == 2

    worker._ACTIVE_BUCKETS[bucket_key]["last_seen"] = datetime_now_minus(seconds=61)
    worker._flush_due_buckets()

    assert len(created) == 1
    assert created[0][1]["attempted_email"].endswith("(x2)")
    assert worker.get_metrics()["events_aggregated"] >= 1


def test_worker_persists_to_dlq_after_retry_exhaustion(monkeypatch):
    fake_redis = DummyRedis()
    monkeypatch.setattr(worker, "_get_redis_client", lambda: fake_redis)

    def fail_create_audit_log(*args, **kwargs):
        raise RuntimeError("db unavailable")

    monkeypatch.setattr(worker.crud_audit, "create_audit_log", fail_create_audit_log)

    event = SecurityLogEvent(
        event_type=SecurityEventType.PASSWORD_CHANGED,
        severity="CRITICAL",
        module="auth",
        action="reset_password",
        status="success",
    )

    worker.reset_metrics()
    worker._persist(event)

    assert fake_redis.llen("security:dlq") == 1
    metrics = worker.get_metrics()
    assert metrics["dlq_count"] == 1
    assert metrics["persist_failures"] >= 1


def test_worker_reconnects_redis_after_connection_error(monkeypatch):
    client_calls = {"created": 0}

    class FlakyRedis:
        def __init__(self):
            self.incr_calls = 0

        def incr(self, key):
            self.incr_calls += 1
            if self.incr_calls == 1:
                raise ConnectionError("redis down")
            return 2

        def expire(self, key, ttl):
            return True

    shared_client = FlakyRedis()

    def build_client():
        client_calls["created"] += 1
        return shared_client

    monkeypatch.setattr(worker, "_create_redis_client", build_client)
    monkeypatch.setattr(worker, "_REDIS_CLIENT", None)
    worker.reset_metrics()

    event = SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="WARN",
        module="auth",
        action="login",
        status="failure",
        user_id=7,
        ip="127.0.0.1",
    )

    assert worker._increment_aggregate_counter(event) == 2
    metrics = worker.get_metrics()
    assert metrics["redis_reconnects"] == 1
    assert client_calls["created"] >= 2


def datetime_now_minus(seconds: int):
    from datetime import datetime, timezone

    return datetime.now(timezone.utc) - timedelta(seconds=seconds)


def test_policies_ignore_and_severity():
    event = SecurityLogEvent(
        event_type=SecurityEventType.LOGIN_FAILED,
        severity="INFO",
        module="auth",
        action="login",
        status="failure",
    )

    assert should_ignore(event) is True
    assert should_log_event(event) is False
    assert get_event_severity(event).value == "WARN"

    event2 = SecurityLogEvent(
        event_type=SecurityEventType.PASSWORD_CHANGED,
        severity="CRITICAL",
        module="auth",
        action="reset_password",
        status="success",
    )
    assert should_ignore(event2) is False
    assert get_event_severity(event2).value == "CRITICAL"
    assert should_aggregate(event2) is False
    assert dedupe_redis_key(event2).startswith("security:event:")
