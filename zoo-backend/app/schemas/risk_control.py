from pydantic import BaseModel, ConfigDict, Field

class RiskControlBase(BaseModel):
    description: str
    control_type: str = Field(..., pattern="^(P|D|C|Di)$")
    automation_level: str = Field(..., pattern="^(A|S|M)$")
    frequency: str = Field(..., pattern="^(PT|D|S|M|A|m|s)$")

class RiskControlCreate(RiskControlBase):
    pass

class RiskControlOut(RiskControlBase):
    id: int
    risk_matrix_entry_id: int
    
    model_config = ConfigDict(from_attributes=True)
