from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class OnboardingTourProgress(Base):
    __tablename__ = "onboarding_tour_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "tour_key", name="uq_onboarding_tour_progress_user_tour"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(120), ForeignKey("users.id"), nullable=False, index=True)
    tour_key = Column(String(120), nullable=False, index=True)
    completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="onboarding_tours")
