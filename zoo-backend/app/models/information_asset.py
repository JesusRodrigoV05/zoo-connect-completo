from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class InformationAsset(Base):
    __tablename__ = "information_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # e.g., Software, Hardware, Datos, Redes, Personal
    
    # CID Values (1-5)
    confidentiality = Column(Integer, default=1)
    integrity = Column(Integer, default=1)
    availability = Column(Integer, default=1)
    
    owner_id = Column(String(120), ForeignKey("users.id"), nullable=True)
    created_by_id = Column(String(120), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User", foreign_keys=[owner_id])
    creator = relationship("User", foreign_keys=[created_by_id])
    risk_entries = relationship("RiskMatrixEntry", back_populates="information_asset")
