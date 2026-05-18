from __future__ import annotations

from typing import Dict, Iterable, List

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.enums import PermissionCode
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_permission import UserPermission


DEFAULT_PERMISSIONS = [
    {
        "code": PermissionCode.MANAGE_USERS.value,
        "name": "Gestionar usuarios",
        "description": "Crear, editar y desactivar usuarios del sistema.",
        "module": "admin",
    },
    {
        "code": PermissionCode.MANAGE_PERMISSIONS.value,
        "name": "Gestionar permisos",
        "description": "Asignar permisos funcionales a cada usuario.",
        "module": "admin",
    },
    {
        "code": PermissionCode.VIEW_AUDIT_LOGS.value,
        "name": "Ver auditoría",
        "description": "Consultar los registros de auditoría del sistema.",
        "module": "admin",
    },
    {
        "code": PermissionCode.VIEW_ADMIN_DASHBOARD.value,
        "name": "Ver panel administrativo",
        "description": "Acceso al panel principal de administración.",
        "module": "admin",
    },
    {
        "code": PermissionCode.MANAGE_ANIMALS.value,
        "name": "Gestionar animales",
        "description": "Crear y editar animales y su información operativa.",
        "module": "animales",
    },
    {
        "code": PermissionCode.MANAGE_ANIMAL_CATALOG.value,
        "name": "Gestionar catálogo animal",
        "description": "Administrar especies, hábitats y archivos de catálogo.",
        "module": "animales",
    },
    {
        "code": PermissionCode.MANAGE_VETERINARY_MODULE.value,
        "name": "Gestionar módulo veterinario",
        "description": "Acceso a historiales, recetas y procedimientos veterinarios.",
        "module": "veterinario",
    },
    {
        "code": PermissionCode.MANAGE_TASKS.value,
        "name": "Gestionar tareas",
        "description": "Crear, asignar y administrar tareas operativas.",
        "module": "tareas",
    },
    {
        "code": PermissionCode.VIEW_INVENTORY.value,
        "name": "Ver inventario",
        "description": "Consultar inventario y reportes asociados.",
        "module": "inventario",
    },
    {
        "code": PermissionCode.MANAGE_INVENTORY.value,
        "name": "Gestionar inventario",
        "description": "Crear, editar y eliminar recursos del inventario.",
        "module": "inventario",
    },
    {
        "code": PermissionCode.MANAGE_SURVEYS.value,
        "name": "Gestionar encuestas",
        "description": "Crear y administrar encuestas y preguntas.",
        "module": "encuestas",
    },
]


def ensure_permissions_catalog(db: Session) -> List[Permission]:
    permissions: List[Permission] = []
    for permission_data in DEFAULT_PERMISSIONS:
        permission = (
            db.query(Permission)
            .filter(Permission.code == permission_data["code"])
            .first()
        )
        if not permission:
            permission = Permission(**permission_data)
            db.add(permission)
            db.flush()
        permissions.append(permission)
    db.commit()
    return permissions


def ensure_role_permissions(db: Session) -> None:
    permissions_by_code = {
        permission.code: permission for permission in db.query(Permission).all()
    }
    role_by_name = {role.name: role for role in db.query(Role).all()}

    role_permissions_map = {
        "administrador": list(permissions_by_code.keys()),
        "osi": [
            PermissionCode.MANAGE_USERS.value,
            PermissionCode.MANAGE_PERMISSIONS.value,
            PermissionCode.VIEW_AUDIT_LOGS.value,
            PermissionCode.VIEW_ADMIN_DASHBOARD.value,
        ],
        "veterinario": [
            PermissionCode.MANAGE_ANIMALS.value,
            PermissionCode.MANAGE_VETERINARY_MODULE.value,
            PermissionCode.VIEW_INVENTORY.value,
        ],
        "cuidador": [
            PermissionCode.MANAGE_ANIMALS.value,
            PermissionCode.MANAGE_TASKS.value,
            PermissionCode.VIEW_INVENTORY.value,
        ],
        "visitante": [],
    }

    for role_name, permission_codes in role_permissions_map.items():
        role = role_by_name.get(role_name)
        if not role:
            continue
        for permission_code in permission_codes:
            permission = permissions_by_code.get(permission_code)
            if not permission:
                continue
            exists = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == permission.id,
                )
                .first()
            )
            if not exists:
                db.add(
                    RolePermission(
                        role_id=role.id, permission_id=permission.id, allowed=True
                    )
                )

    db.commit()


def list_permissions(db: Session) -> List[Permission]:
    return (
        db.query(Permission)
        .filter(Permission.is_active.is_(True))
        .order_by(Permission.module, Permission.name)
        .all()
    )


def _load_user_with_permissions(db: Session, user_id: int) -> User:
    user = (
        db.query(User)
        .options(
            joinedload(User.role)
            .joinedload(Role.role_permissions)
            .joinedload(RolePermission.permission),
            joinedload(User.user_permissions).joinedload(UserPermission.permission),
        )
        .filter(User.id == user_id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


def get_effective_permission_entries(db: Session, user_id: int) -> List[dict]:
    user = _load_user_with_permissions(db, user_id)
    entries: Dict[str, dict] = {}

    for role_permission in getattr(user.role, "role_permissions", []):
        permission = role_permission.permission
        if not permission or not permission.is_active:
            continue
        entries[permission.code] = {
            "permission": permission,
            "allowed": bool(role_permission.allowed),
            "source": "role",
        }

    for user_permission in getattr(user, "user_permissions", []):
        permission = user_permission.permission
        if not permission or not permission.is_active:
            continue
        entries[permission.code] = {
            "permission": permission,
            "allowed": bool(user_permission.allowed),
            "source": "user",
        }

    return list(entries.values())


def get_effective_permission_codes(db: Session, user_id: int) -> List[str]:
    return [
        entry["permission"].code
        for entry in get_effective_permission_entries(db, user_id)
        if entry["allowed"]
    ]


def user_has_permissions(
    db: Session, user_id: int, required_permissions: Iterable[str]
) -> bool:
    effective = set(get_effective_permission_codes(db, user_id))
    return all(permission in effective for permission in required_permissions)


def get_users_with_permissions_query(db: Session):
    return (
        db.query(User)
        .options(
            joinedload(User.role)
            .joinedload(Role.role_permissions)
            .joinedload(RolePermission.permission),
            joinedload(User.user_permissions).joinedload(UserPermission.permission),
        )
        .order_by(User.id)
    )


def replace_user_permissions(
    db: Session, user_id: int, permissions_payload: List[dict]
) -> User:
    _load_user_with_permissions(db, user_id)

    db.query(UserPermission).filter(UserPermission.user_id == user_id).delete()

    permission_ids = [item["permission_id"] for item in permissions_payload]
    permissions_by_id = {
        permission.id: permission
        for permission in db.query(Permission)
        .filter(Permission.id.in_(permission_ids))
        .all()
    }

    for item in permissions_payload:
        permission = permissions_by_id.get(item["permission_id"])
        if not permission:
            continue
        db.add(
            UserPermission(
                user_id=user_id,
                permission_id=permission.id,
                allowed=bool(item.get("allowed", False)),
            )
        )

    db.commit()
    return _load_user_with_permissions(db, user_id)
