from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, conint

from app.schemas.risk_control import RiskControlCreate, RiskControlOut


RiskScore = conint(strict=True, ge=1, le=5)


class RiskMatrixEntryBase(BaseModel):
    information_asset_id: Optional[int] = None
    asset: str = ""
    threat: str = ""
    vulnerability: str = ""
    risk_event: str = ""
    consequence: str = ""
    probability: RiskScore = 1
    impact: RiskScore = 1
    treatment: str = "Aceptar"
    residual_probability: RiskScore = 1
    residual_impact: RiskScore = 1
    controls: list[RiskControlCreate] = Field(default_factory=list)


class RiskMatrixEntryCreate(RiskMatrixEntryBase):
    pass


class RiskMatrixEntryUpdate(RiskMatrixEntryBase):
    pass


class RiskMatrixEntryOut(RiskMatrixEntryBase):
    id: int
    controls: list[RiskControlOut] = Field(default_factory=list)
    created_by_id: Optional[str] = None
    updated_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
