import logging
from enum import Enum
from datetime import date, datetime
from sqlalchemy.orm import Session, Query, joinedload
from typing import Optional

logger = logging.getLogger(__name__)
from app.db.session import SessionLocal
from app.models.audit_log import AuditLog
from app.core.enums import AuditEvent, AuditLogType


SECURITY_EVENTS = {
    AuditEvent.LOGIN_SUCCESS.value,
    AuditEvent.LOGIN_FAILURE.value,
    AuditEvent.V2P_SUCCESS.value,
    AuditEvent.PERMISSION_UPDATE.value,
    AuditEvent.ROLE_PERMISSIONS_UPDATED.value,
}


def _enum_value(value: Enum | str) -> str:
    return value.value if isinstance(value, Enum) else str(value)


def _resolve_log_type(event_value: str, log_type: AuditLogType | str | None) -> str:
    if log_type:
        return _enum_value(log_type)
    if event_value in SECURITY_EVENTS:
        return AuditLogType.SECURITY.value
    return AuditLogType.APPLICATION.value

def create_audit_log(
    *,
    event: AuditEvent | str,
    log_type: AuditLogType | str | None = None,
    action: Optional[str] = None,
    detail: Optional[str] = None,
    user_id: Optional[str] = None,
    attempted_email: Optional[str] = None
) -> None:
    db: Session = SessionLocal()
    
    try:
        event_value = _enum_value(event)
        email_to_log = attempted_email.lower().strip() if attempted_email else None
        
        db_log = AuditLog(
            event=event_value,
            log_type=_resolve_log_type(event_value, log_type),
            action=action,
            detail=detail,
            user_id=user_id,
            attempted_email=email_to_log
        )
        
        db.add(db_log)
        db.commit()
    except Exception as e:
        logger.exception("Error en background task (create_audit_log)")
        db.rollback()
    finally:
        db.close()


def get_audit_logs_query(db: Session) -> Query:
    return db.query(AuditLog).options(
        joinedload(AuditLog.user)
    ).order_by(AuditLog.timestamp.desc())


def get_audit_logs_by_type_query(
    db: Session, 
    log_type: AuditLogType | str,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
    user_id: Optional[str] = None
) -> Query:
    query = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .filter(AuditLog.log_type == _enum_value(log_type))
    )

    if date_from:
        query = query.filter(AuditLog.timestamp >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(AuditLog.timestamp <= datetime.combine(date_to, datetime.max.time()))
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (AuditLog.action.ilike(search_filter)) | 
            (AuditLog.event.ilike(search_filter)) |
            (AuditLog.detail.ilike(search_filter)) |
            (AuditLog.attempted_email.ilike(search_filter))
        )

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    return query.order_by(AuditLog.timestamp.desc())
