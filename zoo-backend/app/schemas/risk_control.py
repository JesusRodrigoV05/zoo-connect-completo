from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class RiskControlBase(BaseModel):
    description: str
    control_type: str = Field(..., pattern="^(P|D|C|Di)$")
    automation_level: str = Field(..., pattern="^(A|S|M)$")
    frequency: str = Field(..., pattern="^(D|S|M|A|PT|m|s)$")
    effectiveness: int = Field(1, ge=1, le=5)

class RiskControlCreate(RiskControlBase):
    pass

class RiskControlOut(RiskControlBase):
    id: int
    risk_matrix_entry_id: int
    
    model_config = ConfigDict(from_attributes=True)
