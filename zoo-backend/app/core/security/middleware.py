import uuid
from datetime import datetime, timezone

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class SecurityContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.security_context = {
            "request_id": request.headers.get("x-request-id") or str(uuid.uuid4()),
            "ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "method": request.method,
            "path": request.url.path,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }

        response = await call_next(request)
        request.state.security_context["status_code"] = response.status_code
        return response
