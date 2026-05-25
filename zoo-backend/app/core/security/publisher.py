from typing import Optional

from fastapi import BackgroundTasks

from .schemas import SecurityLogEvent
from .service import enrich_event_from_request, sanitize_event
from .worker import enqueue_security_event


def publish_security_event(
    event: SecurityLogEvent,
    background_tasks: Optional[BackgroundTasks] = None,
    request=None,
) -> bool:
    try:
        event = enrich_event_from_request(event, request)
        event = sanitize_event(event)

        if background_tasks is not None:
            background_tasks.add_task(enqueue_security_event, event)
            return True

        return enqueue_security_event(event)
    except Exception:
        return False
