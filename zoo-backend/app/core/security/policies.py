from typing import Optional, Set

from .events import SecurityEventType, SecuritySeverity
from .schemas import SecurityLogEvent


IGNORED_EVENTS: Set[SecurityEventType] = set()

CRITICAL_EVENTS: Set[SecurityEventType] = {
    SecurityEventType.ACCOUNT_LOCKED,
    SecurityEventType.PASSWORD_CHANGED,
    SecurityEventType.ROLE_CHANGED,
    SecurityEventType.PERMISSION_CHANGED,
    SecurityEventType.MASS_EXPORT,
}

AGGREGATABLE_EVENTS: Set[SecurityEventType] = {
    SecurityEventType.LOGIN_FAILED,
}


DEDUP_WINDOW_SECONDS = {
    SecurityEventType.LOGIN_FAILED: 60,
    SecurityEventType.ACCOUNT_LOCKED: 300,
}

REDIS_TTL_SECONDS = {
    SecurityEventType.LOGIN_FAILED: 60,
    SecurityEventType.ACCOUNT_LOCKED: 300,
}


def _parse_event_type(event: SecurityLogEvent) -> Optional[SecurityEventType]:
    try:
        return SecurityEventType(event.event_type)
    except ValueError:
        return None


def get_event_severity(event: SecurityLogEvent) -> SecuritySeverity:
    parsed = _parse_event_type(event)
    if parsed in CRITICAL_EVENTS:
        return SecuritySeverity.CRITICAL
    if parsed == SecurityEventType.LOGIN_FAILED:
        return SecuritySeverity.WARN
    return SecuritySeverity.INFO


def should_log_event(event: SecurityLogEvent) -> bool:
    parsed = _parse_event_type(event)
    if parsed is None:
        return event.severity.upper() != SecuritySeverity.INFO.value
    if parsed in IGNORED_EVENTS:
        return False
    if event.severity.upper() == SecuritySeverity.INFO.value:
        return False
    return get_event_severity(event) != SecuritySeverity.INFO


def should_ignore(event: SecurityLogEvent) -> bool:
    return not should_log_event(event)


def should_aggregate(event: SecurityLogEvent) -> bool:
    parsed = _parse_event_type(event)
    return parsed in AGGREGATABLE_EVENTS


def dedupe_window_seconds(event: SecurityLogEvent) -> int:
    parsed = _parse_event_type(event)
    if parsed is None:
        return 0
    return DEDUP_WINDOW_SECONDS.get(parsed, 0)


def dedupe_redis_ttl(event: SecurityLogEvent) -> int:
    parsed = _parse_event_type(event)
    if parsed is None:
        return 60
    return REDIS_TTL_SECONDS.get(parsed, 60)


def dedupe_key(event: SecurityLogEvent) -> tuple:
    return (
        event.event_type,
        event.user_id,
        event.ip,
        event.module,
        event.action,
    )


def dedupe_redis_key(event: SecurityLogEvent) -> str:
    user_part = str(event.user_id) if event.user_id is not None else "anonymous"
    ip_part = event.ip or "unknown"
    return f"security:event:{event.event_type}:{user_part}:{ip_part}"
