import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class TwoFactorCodes(Base):
    __tablename__ = "two_factor_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    code = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="backup_codes")
