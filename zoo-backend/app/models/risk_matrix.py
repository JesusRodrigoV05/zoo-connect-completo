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
    )

    id = Column(Integer, primary_key=True, index=True)
    information_asset_id = Column(Integer, ForeignKey("information_assets.id"), nullable=True)
    asset = Column(Text, nullable=False, default="")
    threat = Column(Text, nullable=False, default="")
    vulnerability = Column(Text, nullable=False, default="")
    risk_event = Column(Text, nullable=False, default="")
    consequence = Column(Text, nullable=False, default="")
    probability = Column(Integer, nullable=False, default=1)
    impact = Column(Integer, nullable=False, default=1)
    treatment = Column(Text, nullable=False, default="Aceptar")
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
    information_asset = relationship("InformationAsset", back_populates="risk_entries")
    controls = relationship(
        "RiskControl",
        back_populates="risk_entry",
        cascade="all, delete-orphan",
        order_by="RiskControl.id",
    )
