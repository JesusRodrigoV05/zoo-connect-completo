from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class RiskControl(Base):
    __tablename__ = "risk_controls"
    __table_args__ = (
        CheckConstraint("control_type IN ('P', 'D', 'C', 'Di')", name="ck_risk_controls_control_type"),
        CheckConstraint("automation_level IN ('A', 'S', 'M')", name="ck_risk_controls_automation_level"),
        CheckConstraint("frequency IN ('PT', 'D', 'S', 'M', 'A', 'm', 's')", name="ck_risk_controls_frequency"),
    )

    id = Column(Integer, primary_key=True, index=True)
    risk_matrix_entry_id = Column(Integer, ForeignKey("risk_matrix_entries.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    control_type = Column(String(5), nullable=False)
    automation_level = Column(String(5), nullable=False)
    frequency = Column(String(5), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    risk_entry = relationship("RiskMatrixEntry", back_populates="controls")
