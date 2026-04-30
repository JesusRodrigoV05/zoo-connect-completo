from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import PermissionCode
from app.crud import permission as crud_permission
from app.crud import user as crud_user
from app.db.session import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        email = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud_user.get_user_by_email(db, email)
    if not user:
        raise credentials_exception
    return user


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)
) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            return None
        email = payload.get("sub")
        if not email:
            return None
    except JWTError:
        return None

    return crud_user.get_user_by_email(db, email)


def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not getattr(current_user, "is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")
    return current_user


def get_current_active_user_optional(
    current_user: User | None = Depends(get_current_user_optional),
):
    if current_user and not getattr(current_user, "is_active", True):
        return None
    return current_user


def require_permission(*required_permissions: PermissionCode):
    required_permission_codes = [permission.value for permission in required_permissions]

    def dependency(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db),
    ):
        if getattr(current_user, "is_admin", False):
            return current_user

        if not crud_permission.user_has_permissions(db, current_user.id, required_permission_codes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes para realizar esta accion",
            )

        return current_user

    return dependency


def require_admin_user(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return require_permission(PermissionCode.VIEW_ADMIN_DASHBOARD)(current_user=current_user, db=db)


def require_animal_management_permission(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return require_permission(PermissionCode.MANAGE_ANIMALS)(current_user=current_user, db=db)


def require_task_management_permission(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return require_permission(PermissionCode.MANAGE_TASKS)(current_user=current_user, db=db)


def require_inventory_read_permission(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return require_permission(PermissionCode.VIEW_INVENTORY)(current_user=current_user, db=db)


def require_veterinario(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return require_permission(PermissionCode.MANAGE_VETERINARY_MODULE)(current_user=current_user, db=db)