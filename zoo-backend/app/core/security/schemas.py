from datetime import datetime, timezone
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SecurityLogEvent(BaseModel):
    event_type: str
    severity: str
    user_id: Optional[int] = None
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    module: str
    action: str
    status: str
    correlation_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
