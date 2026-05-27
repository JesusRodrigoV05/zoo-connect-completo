from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.enums import PermissionCode
from app.crud import permission as crud_permission
from app.crud import role as crud_role
from app.db.base import Base
import app.models  # noqa: F401
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_permission import UserPermission


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return TestingSessionLocal()


def create_user(db, role):
    user_id = "prueba.admin.rol"
    user = User(
        email="role-user@zooconnect.com",
        id=user_id,
        username=user_id,
        hashed_password="not-used",
        role_id=role.id,
        is_active=True,
        email_verified=True,
        phone_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_effective_permissions_are_inherited_from_role_only():
    db = make_session()
    role = Role(name="operaciones")
    dashboard = Permission(
        code=PermissionCode.VIEW_ADMIN_DASHBOARD.value,
        name="Ver panel",
        module="admin",
    )
    users = Permission(
        code=PermissionCode.MANAGE_USERS.value,
        name="Gestionar usuarios",
        module="admin",
    )
    db.add_all([role, dashboard, users])
    db.commit()
    db.refresh(role)
    db.refresh(dashboard)
    db.refresh(users)

    db.add(RolePermission(role_id=role.id, permission_id=dashboard.id, allowed=True))
    user = create_user(db, role)
    assert crud_permission.get_effective_permission_codes(db, user.id) == [
        PermissionCode.VIEW_ADMIN_DASHBOARD.value
    ]


def test_replacing_role_permissions_updates_user_effective_permissions():
    db = make_session()
    role = Role(name="osi 1")
    dashboard = Permission(
        code=PermissionCode.VIEW_ADMIN_DASHBOARD.value,
        name="Ver panel",
        module="admin",
    )
    surveys = Permission(
        code=PermissionCode.MANAGE_SURVEYS.value,
        name="Gestionar encuestas",
        module="encuestas",
    )
    db.add_all([role, dashboard, surveys])
    db.commit()
    db.refresh(role)
    db.refresh(dashboard)
    db.refresh(surveys)
    user = create_user(db, role)

    crud_role.replace_role_permissions(
        db,
        role.id,
        [
            {"permission_id": dashboard.id, "allowed": True},
            {"permission_id": surveys.id, "allowed": True},
        ],
    )

    assert set(crud_permission.get_effective_permission_codes(db, user.id)) == {
        PermissionCode.VIEW_ADMIN_DASHBOARD.value,
        PermissionCode.MANAGE_SURVEYS.value,
    }

    crud_role.replace_role_permissions(
        db,
        role.id,
        [
            {"permission_id": dashboard.id, "allowed": True},
            {"permission_id": surveys.id, "allowed": False},
        ],
    )

    assert crud_permission.get_effective_permission_codes(db, user.id) == [
        PermissionCode.VIEW_ADMIN_DASHBOARD.value
    ]
