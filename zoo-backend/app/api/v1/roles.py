from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Query
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, require_permission
from app.core.enums import PermissionCode
from app.core.security.events import SecurityEventType
from app.core.security.publisher import publish_security_event
from app.core.security.schemas import SecurityLogEvent
from app.crud import permission as crud_permission
from app.crud import role as crud_role
from app.db.session import get_db
from app.models.role import Role
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


def _publish_role_event(
    *,
    background_tasks: BackgroundTasks,
    current_user: User,
    action: str,
    role_name: str,
):
    publish_security_event(
        SecurityLogEvent(
            event_type=SecurityEventType.ROLE_CHANGED,
            severity="CRITICAL",
            user_id=current_user.id,
            module="roles",
            action=action,
            status="success",
            metadata={"role_name": role_name},
        ),
        background_tasks=background_tasks,
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
    background_tasks: BackgroundTasks = None,
):
    try:
        role = crud_role.create_role(db, role_in)
        _publish_role_event(
            background_tasks=background_tasks,
            current_user=current_user,
            action="create_role",
            role_name=role.name,
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
    background_tasks: BackgroundTasks = None,
):
    role = crud_role.update_role(db, role_id, role_in)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    _publish_role_event(
        background_tasks=background_tasks,
        current_user=current_user,
        action="update_role",
        role_name=role.name,
    )

    return _build_role_item(db, role)


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background_tasks: BackgroundTasks = None,
):
    try:
        role = crud_role.get_role(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Rol no encontrado")

        crud_role.delete_role(db, role_id)

        _publish_role_event(
            background_tasks=background_tasks,
            current_user=current_user,
            action="delete_role",
            role_name=role.name,
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
    background_tasks: BackgroundTasks = None,
):
    role = crud_role.replace_role_permissions(
        db=db,
        role_id=role_id,
        permissions_payload=[item.model_dump() for item in payload],
    )

    _publish_role_event(
        background_tasks=background_tasks,
        current_user=current_user,
        action="update_role_permissions",
        role_name=role.name,
    )

    return _build_role_detail(db, role)


def _build_role_item(db: Session, role: Role) -> RoleItem:
    user_count = db.query(User).filter(User.role_id == role.id).count()
    has_custom = db.query(Role).filter(Role.id == role.id).first() is not None

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
