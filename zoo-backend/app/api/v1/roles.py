from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_permission
from app.core.enums import AuditLogType, PermissionCode
from app.crud import audit as crud_audit
from app.crud import permission as crud_permission
from app.crud import role as crud_role
from app.db.session import get_db
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleDetail,
    RoleItem,
    RolePermissionToggle,
    RoleUpdate,
)

router = APIRouter(
    dependencies=[Depends(require_permission(PermissionCode.MANAGE_PERMISSIONS))]
)


@router.get("", response_model=Page[RoleItem])
def list_roles(
    search: Optional[str] = Query(None, description="Buscar por nombre de rol"),
    db: Session = Depends(get_db),
):
    query = db.query(Role)

    if search:
        query = query.filter(Role.name.ilike(f"%{search}%"))

    return paginate(query)


@router.get("/permissions/catalog")
def get_permissions_catalog(db: Session = Depends(get_db)):
    return crud_permission.list_permissions(db)


@router.post("", response_model=RoleItem, status_code=201)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        role = crud_role.create_role(db, role_in)
        crud_audit.create_audit_log(
            event="role_created",
            log_type=AuditLogType.APPLICATION,
            action="Crear rol",
            detail=f"Se creó el rol {role.name}",
            user_id=current_user.id,
            attempted_email=role.name,
        )
        return _build_role_item(db, role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{role_id}", response_model=RoleDetail)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
):
    role = crud_role.get_role_with_permissions(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return _build_role_detail(db, role)


@router.put("/{role_id}", response_model=RoleItem)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    role = crud_role.update_role(db, role_id, role_in)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    crud_audit.create_audit_log(
        event="role_updated",
        log_type=AuditLogType.APPLICATION,
        action="Actualizar rol",
        detail=f"Se actualizó el rol {role.name}",
        user_id=current_user.id,
        attempted_email=role.name,
    )

    return _build_role_item(db, role)


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        role = crud_role.get_role(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Rol no encontrado")

        crud_role.delete_role(db, role_id)

        crud_audit.create_audit_log(
            event="role_deleted",
            log_type=AuditLogType.APPLICATION,
            action="Eliminar rol",
            detail=f"Se eliminó el rol {role.name}",
            user_id=current_user.id,
            attempted_email=role.name,
        )

        return {"message": "Rol eliminado correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{role_id}/permissions", response_model=RoleDetail)
def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
):
    role = crud_role.get_role_with_permissions(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return _build_role_detail(db, role)


@router.put("/{role_id}/permissions", response_model=RoleDetail)
def update_role_permissions(
    role_id: int,
    payload: List[RolePermissionToggle] = Body(default_factory=list),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    role = crud_role.replace_role_permissions(
        db=db,
        role_id=role_id,
        permissions_payload=[item.model_dump() for item in payload],
    )

    crud_audit.create_audit_log(
        event="role_permissions_updated",
        log_type=AuditLogType.SECURITY,
        action="Actualizar permisos de rol",
        detail=f"Se actualizaron los permisos del rol {role.name}",
        user_id=current_user.id,
        attempted_email=role.name,
    )

    return _build_role_detail(db, role)


def _build_role_item(db: Session, role: Role) -> RoleItem:
    user_count = db.query(User).filter(User.role_id == role.id).count()
    has_custom = (
        db.query(RolePermission).filter(RolePermission.role_id == role.id).first()
        is not None
    )

    return RoleItem(
        id=role.id,
        name=role.name,
        user_count=user_count,
        has_custom_permissions=has_custom,
    )


def _build_role_detail(db: Session, role: Role) -> RoleDetail:
    from app.schemas.role import RolePermissionState

    user_count = db.query(User).filter(User.role_id == role.id).count()
    permissions = [
        RolePermissionState(
            id=rp.permission.id,
            code=rp.permission.code,
            name=rp.permission.name,
            description=rp.permission.description,
            module=rp.permission.module,
            is_active=rp.permission.is_active,
            allowed=rp.allowed,
        )
        for rp in getattr(role, "role_permissions", [])
        if rp.permission and rp.permission.is_active
    ]

    return RoleDetail(
        id=role.id,
        name=role.name,
        user_count=user_count,
        has_custom_permissions=len(permissions) > 0,
        permissions=permissions,
    )
