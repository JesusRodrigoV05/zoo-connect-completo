import json
import logging
import queue
import threading
import time
from datetime import datetime, timedelta, timezone

import redis as redis_sync
from app.core.config import settings
from app.crud import audit as crud_audit

from .policies import (
    dedupe_key,
    dedupe_redis_key,
    dedupe_redis_ttl,
    dedupe_window_seconds,
    should_aggregate,
    should_ignore,
)
from .schemas import SecurityLogEvent


logger = logging.getLogger("security.worker")
MAX_PERSIST_RETRIES = 5
BASE_BACKOFF_SECONDS = 0.1
MAX_BACKOFF_SECONDS = 2.0
DLQ_KEY = "security:dlq"

_EVENT_QUEUE: "queue.Queue[SecurityLogEvent]" = queue.Queue(maxsize=1000)
_WORKER_STARTED = False
_WORKER_LOCK = threading.Lock()
_ACTIVE_BUCKETS = {}

_EVENTS_PROCESSED = 0
_EVENTS_DISCARDED = 0
_EVENTS_AGGREGATED = 0
_WORKER_ERRORS = 0
_PERSIST_FAILURES = 0
_DLQ_COUNT = 0
_REDIS_RECONNECTS = 0
_PROCESSING_TIME_MS = 0
_METRICS_LOCK = threading.Lock()

_REDIS_CLIENT = None
_REDIS_CLIENT_LOCK = threading.Lock()


def _increment_metric(name: str) -> None:
    with _METRICS_LOCK:
        global _EVENTS_PROCESSED, _EVENTS_DISCARDED, _EVENTS_AGGREGATED, _WORKER_ERRORS
        global _PERSIST_FAILURES, _DLQ_COUNT, _REDIS_RECONNECTS, _PROCESSING_TIME_MS

        if name == "processed":
            _EVENTS_PROCESSED += 1
        elif name == "discarded":
            _EVENTS_DISCARDED += 1
        elif name == "aggregated":
            _EVENTS_AGGREGATED += 1
        elif name == "errors":
            _WORKER_ERRORS += 1
        elif name == "persist_failures":
            _PERSIST_FAILURES += 1
        elif name == "dlq_count":
            _DLQ_COUNT += 1
        elif name == "redis_reconnects":
            _REDIS_RECONNECTS += 1
        elif name == "processing_time_ms":
            _PROCESSING_TIME_MS += 1


def _record_processing_time(duration_ms: float) -> None:
    with _METRICS_LOCK:
        global _PROCESSING_TIME_MS
        _PROCESSING_TIME_MS += int(duration_ms)


def get_metrics() -> dict:
    with _METRICS_LOCK:
        return {
            "events_processed": _EVENTS_PROCESSED,
            "events_discarded": _EVENTS_DISCARDED,
            "events_aggregated": _EVENTS_AGGREGATED,
            "worker_errors": _WORKER_ERRORS,
            "persist_failures": _PERSIST_FAILURES,
            "dlq_count": _DLQ_COUNT,
            "redis_reconnects": _REDIS_RECONNECTS,
            "processing_time_ms": _PROCESSING_TIME_MS,
            "queue_size": _EVENT_QUEUE.qsize(),
        }


def reset_metrics() -> None:
    with _METRICS_LOCK:
        global _EVENTS_PROCESSED, _EVENTS_DISCARDED, _EVENTS_AGGREGATED, _WORKER_ERRORS
        global _PERSIST_FAILURES, _DLQ_COUNT, _REDIS_RECONNECTS, _PROCESSING_TIME_MS
        _EVENTS_PROCESSED = 0
        _EVENTS_DISCARDED = 0
        _EVENTS_AGGREGATED = 0
        _WORKER_ERRORS = 0
        _PERSIST_FAILURES = 0
        _DLQ_COUNT = 0
        _REDIS_RECONNECTS = 0
        _PROCESSING_TIME_MS = 0


def _create_redis_client() -> redis_sync.Redis:
    return redis_sync.Redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_timeout=1,
        socket_connect_timeout=1,
    )


def _get_redis_client() -> redis_sync.Redis | None:
    global _REDIS_CLIENT
    with _REDIS_CLIENT_LOCK:
        if _REDIS_CLIENT is not None:
            return _REDIS_CLIENT
        try:
            _REDIS_CLIENT = _create_redis_client()
        except Exception as exc:
            _REDIS_CLIENT = None
            logger.warning("security worker redis unavailable: %s", exc)
        return _REDIS_CLIENT


def _reset_redis_client() -> None:
    global _REDIS_CLIENT
    with _REDIS_CLIENT_LOCK:
        _REDIS_CLIENT = None


def _mark_redis_reconnect() -> None:
    _increment_metric("redis_reconnects")
    logger.warning("security worker redis reconnect required")


def _compute_backoff(attempt: int) -> float:
    return min(MAX_BACKOFF_SECONDS, BASE_BACKOFF_SECONDS * (2 ** (attempt - 1)))


def _serialize_event(event: SecurityLogEvent, count: int = 1) -> dict:
    payload = event.model_dump(mode="json")
    payload["dedup_count"] = count
    return payload


def _increment_aggregate_counter(event: SecurityLogEvent) -> int:
    client = _get_redis_client()
    if client is None:
        return 1

    try:
        key = dedupe_redis_key(event)
        count = client.incr(key)
        if count == 1:
            client.expire(key, dedupe_redis_ttl(event))
        return int(count)
    except Exception:
        _mark_redis_reconnect()
        _reset_redis_client()
        client = _get_redis_client()
        if client is None:
            return 1
        try:
            key = dedupe_redis_key(event)
            count = client.incr(key)
            if count == 1:
                client.expire(key, dedupe_redis_ttl(event))
            return int(count)
        except Exception:
            _increment_metric("errors")
            return 1


def start_worker() -> None:
    global _WORKER_STARTED
    with _WORKER_LOCK:
        if _WORKER_STARTED:
            return
        _WORKER_STARTED = True
        worker = threading.Thread(target=_run_worker, daemon=True, name="security-log-worker")
        worker.start()


def enqueue_security_event(event: SecurityLogEvent) -> bool:
    try:
        if should_ignore(event):
            _increment_metric("discarded")
            return False

        start_worker()
        _EVENT_QUEUE.put_nowait(event)
        _increment_metric("processed")
        return True
    except Exception:
        _increment_metric("errors")
        return False


def _run_worker() -> None:
    while True:
        try:
            event = _EVENT_QUEUE.get(timeout=1)
            _process_event(event)
        except queue.Empty:
            pass
        except Exception:
            _increment_metric("errors")
        _flush_due_buckets()


def _process_event(event: SecurityLogEvent) -> None:
    if not isinstance(event, SecurityLogEvent):
        _increment_metric("errors")
        logger.warning("security worker dropped invalid payload: %r", event)
        return

    started = time.monotonic()
    try:
        window = dedupe_window_seconds(event)
        if not window:
            _persist(event)
            return

        count = 1
        if should_aggregate(event):
            count = _increment_aggregate_counter(event)
            if count > 1:
                _increment_metric("aggregated")

        key = dedupe_key(event)
        now = datetime.now(timezone.utc)
        bucket = _ACTIVE_BUCKETS.get(key)

        if bucket is None:
            _ACTIVE_BUCKETS[key] = {
                "event": event,
                "count": count,
                "last_seen": now,
            }
            return

        bucket["count"] = max(bucket["count"], count)
        bucket["last_seen"] = now
    except Exception:
        _increment_metric("errors")
    finally:
        _record_processing_time((time.monotonic() - started) * 1000)


def _flush_due_buckets() -> None:
    now = datetime.now(timezone.utc)
    due_keys = []

    for key, bucket in list(_ACTIVE_BUCKETS.items()):
        window = dedupe_window_seconds(bucket["event"])
        if not window:
            continue
        if now - bucket["last_seen"] >= timedelta(seconds=window):
            due_keys.append(key)

    for key in due_keys:
        bucket = _ACTIVE_BUCKETS.pop(key)
        _persist(bucket["event"], bucket["count"])


def _persist(event: SecurityLogEvent, count: int = 1) -> bool:
    metadata = dict(event.metadata or {})
    attempted_email = metadata.get("attempted_email")
    if count > 1:
        metadata["dedup_count"] = count
        if attempted_email:
            attempted_email = f"{attempted_email} (x{count})"
        else:
            attempted_email = f"aggregated:{count}"

    for attempt in range(1, MAX_PERSIST_RETRIES + 1):
        try:
            crud_audit.create_audit_log(
                event=event.event_type,
                user_id=event.user_id,
                attempted_email=attempted_email,
            )
            return True
        except Exception as exc:
            _increment_metric("errors")
            _increment_metric("persist_failures")
            logger.warning("security persist failed attempt=%s error=%s", attempt, exc)
            if attempt == MAX_PERSIST_RETRIES:
                return _send_to_dlq(event, count, attempted_email, str(exc))
            time.sleep(_compute_backoff(attempt))

    return False


def _send_to_dlq(event: SecurityLogEvent, count: int, attempted_email: str | None, error: str) -> bool:
    payload = {
        "event": _serialize_event(event, count),
        "attempted_email": attempted_email,
        "error": error,
        "received_at": datetime.now(timezone.utc).isoformat(),
    }
    client = _get_redis_client()
    if client is None:
        logger.error("security worker dlq unavailable because redis is not configured")
        _increment_metric("errors")
        return False

    try:
        client.rpush(DLQ_KEY, json.dumps(payload, default=str))
        _increment_metric("dlq_count")
        logger.error("security worker queued event to dlq; event_type=%s", event.event_type)
        return True
    except Exception as exc:
        _mark_redis_reconnect()
        _reset_redis_client()
        _increment_metric("errors")
        logger.exception("security worker failed to write dlq entry: %s", exc)
        return False
