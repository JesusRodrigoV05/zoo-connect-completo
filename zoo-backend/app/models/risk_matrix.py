from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class RiskMatrixEntry(Base):
    __tablename__ = "risk_matrix_entries"
    __table_args__ = (
        CheckConstraint("probability BETWEEN 1 AND 5", name="ck_risk_matrix_probability"),
        CheckConstraint("impact BETWEEN 1 AND 5", name="ck_risk_matrix_impact"),
        CheckConstraint(
            "residual_probability BETWEEN 1 AND 5",
            name="ck_risk_matrix_residual_probability",
        ),
        CheckConstraint(
            "residual_impact BETWEEN 1 AND 5",
            name="ck_risk_matrix_residual_impact",
        ),
        CheckConstraint(
            "control_type IN ('P', 'D', 'C', 'Di')",
            name="ck_risk_matrix_control_type",
        ),
        CheckConstraint(
            "automation_level IN ('A', 'S', 'M')",
            name="ck_risk_matrix_automation_level",
        ),
        CheckConstraint(
            "frequency IN ('D', 'S', 'M', 'A', 'PT', 'm', 's')",
            name="ck_risk_matrix_frequency",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    asset = Column(Text, nullable=False, default="")
    threat = Column(Text, nullable=False, default="")
    consequence = Column(Text, nullable=False, default="")
    probability = Column(Integer, nullable=False, default=1)
    impact = Column(Integer, nullable=False, default=1)
    treatment = Column(Text, nullable=False, default="Aceptar")
    control = Column(Text, nullable=False, default="")
    control_type = Column(Text, nullable=False, default="P")
    automation_level = Column(Text, nullable=False, default="M")
    frequency = Column(Text, nullable=False, default="M")
    residual_probability = Column(Integer, nullable=False, default=1)
    residual_impact = Column(Integer, nullable=False, default=1)
    created_by_id = Column(String(120), ForeignKey("users.id"), nullable=True, index=True)
    updated_by_id = Column(String(120), ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
