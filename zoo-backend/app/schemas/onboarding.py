from datetime import datetime
from pydantic import BaseModel, ConfigDict


class OnboardingTourStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tour_key: str
    completed: bool
    completed_at: datetime | None = None
