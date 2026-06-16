from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class InformationAssetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    confidentiality: int = Field(1, ge=1, le=5)
    integrity: int = Field(1, ge=1, le=5)
    availability: int = Field(1, ge=1, le=5)
    owner_id: Optional[str] = None

class InformationAssetCreate(InformationAssetBase):
    pass

class InformationAssetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    confidentiality: Optional[int] = Field(None, ge=1, le=5)
    integrity: Optional[int] = Field(None, ge=1, le=5)
    availability: Optional[int] = Field(None, ge=1, le=5)
    owner_id: Optional[str] = None

class InformationAssetOut(InformationAssetBase):
    id: int
    created_by_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
