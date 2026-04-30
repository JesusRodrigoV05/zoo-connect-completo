from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import user as crud_user
from app.schemas.user import UserOut, AdminUserCreate, AdminUserUpdate
from app.core.dependencies import require_permission
from app.core.enums import PermissionCode

from fastapi_pagination import Page, Params
from app.schemas.user import UserOutWithRole
from fastapi_pagination.ext.sqlalchemy import paginate

# auditoria
from app.schemas.audit import AuditLogOut
from app.crud import audit as crud_audit

# password history
from app.models.password_history import PasswordHistory
from app.schemas.auth import PasswordHistoryOut

router = APIRouter(
    dependencies=[Depends(require_permission(PermissionCode.MANAGE_USERS))]
)

@router.get(
    "/users",
    response_model=Page[UserOutWithRole],
    dependencies=[Depends(require_permission(PermissionCode.MANAGE_USERS))],
)
def admin_list_users(
    role_id: Optional[int] = Query(
        None, description="Filtrar por ID de Rol (1:Admin, 3:Cuidador, 4:Vet)"
    ),
    is_active: Optional[bool] = Query(
        None, description="Filtrar por estado activo/inactivo"
    ),
    search: Optional[str] = Query(None, description="Buscar por nombre o email"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    db: Session = Depends(get_db),
):
    params = Params(page=page, size=page_size)
    query = crud_user.get_users_query(
        db=db, role_id=role_id, is_active=is_active, search=search
    )
    return paginate(query, params)
    db: Session = Depends(get_db),


@router.get("/users/{user_id}", response_model=UserOut)
def admin_get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_user.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return user


@router.post("/users", response_model=UserOut, status_code=201)
def admin_create_user(user_in: AdminUserCreate, db: Session = Depends(get_db)):
    if crud_user.get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado"
        )
    return crud_user.create_user_by_admin(db=db, user_in=user_in)


@router.put("/users/{user_id}", response_model=UserOut)
def admin_update_user(
    user_id: int, user_in: AdminUserUpdate, db: Session = Depends(get_db)
):
    user_db = crud_user.get_user(db, user_id)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return crud_user.update_user_by_admin(
        db=db, db_user_to_update=user_db, user_in=user_in
    )


@router.delete("/users/{user_id}", response_model=UserOut)
def admin_delete_user(user_id: int, db: Session = Depends(get_db)):
    user_db = crud_user.get_user(db, user_id)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return crud_user.delete_user_by_admin(db=db, user_id_to_delete=user_id)


@router.get(
    "/audit-logs",
    response_model=Page[AuditLogOut],
    dependencies=[Depends(require_permission(PermissionCode.VIEW_AUDIT_LOGS))],
    summary="Obtener logs de auditoria de autenticacion",
)
def get_audit_logs(db: Session = Depends(get_db)):
    return paginate(crud_audit.get_audit_logs_query(db=db))

@router.get(
    "/users/{user_id}/password-history",
    response_model=List[PasswordHistoryOut],
    summary="Obtener histórico de contraseñas de un usuario",
)
def get_user_password_history(
    user_id: int,
    limit: int = Query(10, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db),
):
    """Obtiene el histórico de contraseñas de un usuario específico."""
    user = crud_user.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    history = crud_user.get_password_history(db=db, user_id=user_id, limit=limit)
    return [
        {
            "id": record.id,
            "user_id": record.user_id,
            "password_hash": record.password_hash,
            "created_at": record.created_at,
        }
        for record in history
    ]


@router.delete(
    "/users/{user_id}/password-history",
    status_code=status.HTTP_200_OK,
    summary="Limpiar histórico de contraseñas de un usuario",
)
def clear_user_password_history(user_id: int, db: Session = Depends(get_db)):
    """Elimina todo el histórico de contraseñas de un usuario específico."""
    user = crud_user.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    deleted_count = (
        db.query(PasswordHistory).filter(PasswordHistory.user_id == user_id).delete()
    )
    db.commit()

    return {
        "msg": f"Se eliminaron {deleted_count} registros del histórico de contraseñas"
    }
