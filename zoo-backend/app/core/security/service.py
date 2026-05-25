import json
from typing import Any, Dict, Optional

from fastapi import Request

from .schemas import SecurityLogEvent
from .policies import get_event_severity

MAX_METADATA_BYTES = 4096
MAX_VALUE_LENGTH = 1024
SENSITIVE_SUBSTRINGS = [
    "password",
    "token",
    "secret",
    "cookie",
    "authorization",
    "set-cookie",
    "header",
]


def _is_sensitive_key(key: str) -> bool:
    key_lower = key.lower()
    return any(sub in key_lower for sub in SENSITIVE_SUBSTRINGS)


def _sanitize_value(value: Any) -> Any:
    if isinstance(value, str):
        if len(value) > MAX_VALUE_LENGTH:
            return value[:MAX_VALUE_LENGTH] + "..."
        return value
    if isinstance(value, bool) or isinstance(value, int) or isinstance(value, float):
        return value
    if isinstance(value, dict):
        return _sanitize_metadata(value)
    if isinstance(value, list):
        return [_sanitize_value(item) for item in value]
    try:
        return str(value)
    except Exception:
        return "<redacted>"


def _sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    safe: Dict[str, Any] = {}
    for key, value in metadata.items():
        if _is_sensitive_key(key):
            continue
        sanitized_value = _sanitize_value(value)
        if sanitized_value is None:
            continue
        safe[key] = sanitized_value
    output = {}
    current_size = 0
    for key, value in safe.items():
        try:
            chunk = json.dumps({key: value})
        except Exception:
            continue
        if current_size + len(chunk) > MAX_METADATA_BYTES:
            break
        output[key] = value
        current_size += len(chunk)
    return output


def enrich_event_from_request(event: SecurityLogEvent, request: Optional[Request] = None) -> SecurityLogEvent:
    if request is None:
        return event

    context = getattr(getattr(request, "state", None), "security_context", {})
    if not context:
        return event

    updates = {}
    if event.ip is None and context.get("ip"):
        updates["ip"] = context.get("ip")
    if event.user_agent is None and context.get("user_agent"):
        updates["user_agent"] = context.get("user_agent")
    if event.correlation_id is None and context.get("request_id"):
        updates["correlation_id"] = context.get("request_id")

    if updates:
        event = event.model_copy(update=updates)

    return event


def sanitize_event(event: SecurityLogEvent) -> SecurityLogEvent:
    severity = event.severity.upper()
    if severity not in {"INFO", "WARN", "CRITICAL"}:
        severity = get_event_severity(event).value

    metadata = event.metadata or {}
    metadata = _sanitize_metadata(metadata)

    return event.model_copy(update={"severity": severity, "metadata": metadata})
