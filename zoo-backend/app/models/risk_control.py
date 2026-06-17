from sqlalchemy import Column, ForeignKey, Integer, String, Text, func, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base

class RiskControl(Base):
    __tablename__ = "risk_controls"

    id = Column(Integer, primary_key=True, index=True)
    risk_matrix_entry_id = Column(Integer, ForeignKey("risk_matrix_entries.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    control_type = Column(String(5), nullable=False) # P, D, C, Di
    automation_level = Column(String(5), nullable=False) # A, S, M
    frequency = Column(String(5), nullable=False) # D, S, M, A, PT, m, s
    effectiveness = Column(Integer, nullable=False, default=1) # 1-5
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    risk_entry = relationship("RiskMatrixEntry", back_populates="controls")
