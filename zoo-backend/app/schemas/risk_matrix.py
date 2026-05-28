from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RiskMatrixEntryBase(BaseModel):
    asset: str = ""
    threat: str = ""
    consequence: str = ""
    probability: int = Field(1, ge=1, le=5)
    impact: int = Field(1, ge=1, le=5)
    treatment: str = "Aceptar"
    control: str = ""
    control_type: str = Field("P", pattern="^(P|D|C|Di)$")
    automation_level: str = Field("M", pattern="^(A|S|M)$")
    frequency: str = Field("M", pattern="^(D|S|M|A|PT|m|s)$")
    residual_probability: int = Field(1, ge=1, le=5)
    residual_impact: int = Field(1, ge=1, le=5)


class RiskMatrixEntryCreate(RiskMatrixEntryBase):
    pass


class RiskMatrixEntryUpdate(RiskMatrixEntryBase):
    pass


class RiskMatrixEntryOut(RiskMatrixEntryBase):
    id: int
    created_by_id: Optional[str] = None
    updated_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
