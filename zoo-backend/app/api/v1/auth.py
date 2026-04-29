from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Request,
    status,
    Response,
    Cookie,
)
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db.session import get_db
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserUpdateProfile,
    UserProfileOut,
    UserCreateResponse,
)
from app.crud import user as crud_user
from app.crud import token as crud_token
from app.crud.auth import authenticate_user
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

# reset token
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.core import email_service
from app.core.password_utils import generate_strong_password
from app.crud import token as crud_token

#
# 2fa
from typing import Optional, Union
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    LoginStep2Response,
    TOTPLoginRequest,
)
from app.crud import two_factor as crud_2fa
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_2fa_session_token,
    settings,
)
from app.core.encryption import decrypt_data

# probando rate limitng
from app.rate_limiting import limiter

# cookies
from app.crud.auth import set_refresh_cookie, clear_refresh_cookie

# redis
from redis.asyncio import Redis
from app.db.cache import get_cache_client
from app.crud import audit as crud_audit
from app.core import policia
from app.core.rsa_manager import RSAManager
from app.core.enums import AuditEvent
from app.core.security import verify_password
from app.crud import permission as crud_permission

# recaptcha
from app.core.recaptcha import verify_recaptcha, is_valid_recaptcha

router = APIRouter()


@router.get("/public-key")
def get_public_key():
    """
    Retorna la llave pública RSA del día para cifrar datos sensibles en el cliente.
    """
    _, public_key_pem = RSAManager.get_keys()
    return {"public_key": public_key_pem}


def _get_role_claim(user: User) -> str | None:
    if user.role:
        return user.role.name
    return None


def _issue_tokens_for_user(user, db: Session):
    extra_claims = {"role": _get_role_claim(user)} if _get_role_claim(user) else None
    access_token = create_access_token(subject=user.email, extra_claims=extra_claims)

    rt = create_refresh_token(subject=user.email)
    crud_token.create_refresh_token_record(
        db,
        user_id=user.id,
        jti=rt["jti"],
        expires_at=rt["expires_at"],
        device_info=rt.get("device_info"),
    )

    return access_token, rt["token"]


# crud_user.create_public_user ya maneja IntegrityError y lanza un HTTPException 409
@router.post("/register", response_model=UserCreateResponse, status_code=201)
async def register(
    user_in: UserCreate, request: Request, db: Session = Depends(get_db)
):
    # 0. Verificar reCAPTCHA v2 (server-side) para creación de usuarios
    if hasattr(user_in, "recaptcha_token") and user_in.recaptcha_token:
        client_ip = request.client.host if request.client else None
        recaptcha_result = await verify_recaptcha(user_in.recaptcha_token, client_ip)
        if not is_valid_recaptcha(recaptcha_result):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Verificación de seguridad fallida. Intenta nuevamente.",
            )
    elif settings.RECAPTCHA_SECRET_KEY != "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falta verificación de seguridad (reCAPTCHA).",
        )

    # 1. Intentar descifrar la contraseña si viene cifrada (RSA)
    if user_in.password and not user_in.generate_password:
        try:
            decrypted_password = RSAManager.decrypt_password(user_in.password)
            user_in.password = decrypted_password
        except Exception as e:
            # Forzamos el cifrado según requerimiento
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error de seguridad: La contraseña debe estar cifrada con la llave del día.",
            )

    # Si el cliente solicita generación, creamos una segura.
    data = user_in.model_dump()
    generate_flag = data.get("generate_password", False)
    generated_password = None

    if generate_flag:
        generated_password = generate_strong_password()
        data["password"] = generated_password

    # Reconstruir el modelo para que corran validadores de fuerza sobre la contraseña ya descifrada
    try:
        user_in_with_password = UserCreate(**data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = crud_user.create_public_user(db=db, user_in=user_in_with_password)

    # Devolver la información del usuario y, si se generó, la contraseña temporal
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "role_id": user.role_id,
        "photo_url": user.photo_url,
        "created_at": user.created_at,
        "generated_password": generated_password,
    }


# rate limiting
@router.post("/login", response_model=Union[TokenResponse, LoginStep2Response])
@limiter.limit("10/minute")
async def login(
    request: Request,
    # prueba redis
    background_tasks: BackgroundTasks,
    #
    response: Response,
    payload: LoginRequest,
    db: Session = Depends(get_db),
    cache: Redis = Depends(get_cache_client),
):

    # 0. Verificar reCAPTCHA v2 (server-side)
    if payload.recaptcha_token:
        client_ip = request.client.host if request.client else None
        recaptcha_result = await verify_recaptcha(payload.recaptcha_token, client_ip)
        if not is_valid_recaptcha(recaptcha_result):
            background_tasks.add_task(
                crud_audit.create_audit_log,
                event=AuditEvent.LOGIN_FAILURE,
                attempted_email=payload.email,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Verificación de seguridad fallida. Intenta nuevamente.",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Verificación de seguridad fallida. Intente nuevamente.",
            )
    elif settings.RECAPTCHA_SECRET_KEY != "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falta verificación de seguridad (reCAPTCHA).",
        )

    # 1. Descifrar contraseña RSA
    try:
        decrypted_password = RSAManager.decrypt_password(payload.password)
        payload.password = decrypted_password
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de seguridad: Credenciales no cifradas correctamente.",
        )

    # paso 1
    user = crud_user.get_user_by_email(db, payload.email)
    # paso 2 manejar el usuario no encontrado
    if not user:
        background_tasks.add_task(
            crud_audit.create_audit_log,
            # db,
            event=AuditEvent.LOGIN_FAILURE,
            attempted_email=payload.email,
        )
        # Incrementamos nuestro contador
        await policia.increment_login_failure(payload.email, cache)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas"
        )

    # el usuario existe ahora verificamos si no esta blqoueado
    if policia.is_account_locked(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta bloqueada temporalmente, intente mas tarde",
        )
    # el usuario existe ya aparte no esta bloqueado, vemos la contraseña
    if not verify_password(payload.password, user.hashed_password):
        # Contraseña incorrecta.
        background_tasks.add_task(
            crud_audit.create_audit_log,
            # db,
            event=AuditEvent.LOGIN_FAILURE,
            user_id=user.id,
            attempted_email=user.email,
        )

        await policia.increment_login_failure(user.email, cache)

        failures = await policia.get_login_failures(user.email, cache)
        if failures >= policia.MAX_FAILED_ATTEMPTS:
            background_tasks.add_task(policia.lock_account, user_id=user.id)
            await policia.clear_login_failures(user.email, cache)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas"
        )
    # contraseña correcta vemos si esta activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario inactivo"
        )
    # limpiadmor contadores redis
    await policia.clear_login_failures(user.email, cache)
    # comprobamos 2fa
    if user.is_totp_enabled:
        session_token = create_2fa_session_token(subject=user.email)
        return LoginStep2Response(session_token=session_token)
    # login exitoso
    background_tasks.add_task(
        crud_audit.create_audit_log,
        # db,
        event=AuditEvent.LOGIN_SUCCESS,
        user_id=user.id,
        attempted_email=user.email,
    )

    access_token, refresh_token = _issue_tokens_for_user(user, db)
    #
    set_refresh_cookie(response, refresh_token)
    # return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    return TokenResponse(access_token=access_token, token_type="bearer")


# 2fA
@router.post("/2fa/verify-login", response_model=TokenResponse)
async def verify_login_2fa(
    body: TOTPLoginRequest,
    response: Response,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    cache: Redis = Depends(get_cache_client),
):
    # verficamos token y codigo 2fa

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de sesion 2FA invalido",
    )

    try:
        payload = jwt.decode(
            body.session_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "pre_2fa":
            raise credentials_exception
        email = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # 2. Obtener el usuario
    user = crud_user.get_user_by_email(db, email)
    if not user or not user.is_active or not user.is_totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario no válido para 2FA"
        )

    # 3. Verificar el codigo
    is_code_valid = False

    if len(body.code) == 6:
        try:
            secret = decrypt_data(user.totp_secret)
            is_code_valid = crud_2fa.verify_totp_code(secret, body.code)
        except Exception:
            is_code_valid = False
    else:
        is_code_valid = crud_2fa.validate_backup_code(db, user, body.code)

    if not is_code_valid:
        background_tasks.add_task(
            crud_audit.create_audit_log,
            # db,
            event=AuditEvent.LOGIN_FAILURE,
            user_id=user.id,
            attempted_email=user.email,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Codigo 2fa invalido"
        )

    background_tasks.add_task(
        crud_audit.create_audit_log,
        # db,
        event=AuditEvent.V2P_SUCCESS,
        user_id=user.id,
        attempted_email=user.email,
    )

    await policia.clear_login_failures(user.email, cache)

    access_token, refresh_token = _issue_tokens_for_user(user, db)
    set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token, token_type="bearer")


""""
@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = jwt.decode(body.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Token nvalido")
        jti, sub = decoded.get("jti"), decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalido")

    if not crud_token.is_refresh_token_valid(db, jti):
        raise HTTPException(status_code=401, detail="Refresh token invalido o revocado")

    crud_token.revoke_refresh_token_by_jti(db, jti)

    user = crud_user.get_user_by_email(db, sub)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    access_token, refresh_token = _issue_tokens_for_user(user, db)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
"""


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="No se encontro refresh token")

    try:
        decoded = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Token invalido")
        jti, sub = decoded.get("jti"), decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalido")

    if not crud_token.is_refresh_token_valid(db, jti):
        raise HTTPException(status_code=401, detail="Refresh token inalido")

    crud_token.revoke_refresh_token_by_jti(db, jti)
    user = crud_user.get_user_by_email(db, sub)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_access_token, new_refresh_token = _issue_tokens_for_user(user, db)
    set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(access_token=new_access_token, token_type="bearer")


""""
@router.post("/logout")
def logout(body: TokenRefreshRequest, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    try:
        decoded = jwt.decode(body.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        jti = decoded.get("jti")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalido")

    crud_token.revoke_refresh_token_by_jti(db, jti)
    return {"msg": "logout OK"}
"""


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: Optional[str] = Cookie(None),
    current_user: User = Depends(get_current_active_user),
):
    if refresh_token:
        try:
            decoded = jwt.decode(
                refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            jti = decoded.get("jti")
            if jti:
                crud_token.revoke_refresh_token_by_jti(db, jti)
        except JWTError:
            pass
    clear_refresh_cookie(response)

    return {"msg": "logout OK"}


@router.get("/me", response_model=UserOut)
@router.get("/me", response_model=UserProfileOut)
def read_users_me(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "role_id": current_user.role_id,
        "photo_url": current_user.photo_url,
        "created_at": current_user.created_at,
        "permissions": crud_permission.get_effective_permission_codes(
            db, current_user.id
        ),
    }


# endpoints reset password
@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):

    user = crud_user.get_user_by_email(db, email=body.email)

    if user:
        token = crud_token.create_password_reset_token(db, user_id=user.id)

        background_tasks.add_task(
            email_service.send_password_reset_email,
            email_to=user.email,
            token=token,
            username=user.username,
        )

    return {"msg": "Se envio un enlace de recupracion"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = crud_token.get_user_by_reset_token(db, token=body.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token es invaslido o ha expirado",
        )

    crud_user.update_password(db, db_user=user, new_password=body.new_password)

    crud_token.delete_reset_token(db, token=body.token)

    return {"msg": "Contraseña actualizada exitosamente"}


# put user
@router.put("/update-profile", response_model=UserOut)
@router.put("/update-profile", response_model=UserProfileOut)
async def update_users_me(
    user_in: UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    if user_in.email and user_in.email != current_user.email:
        existing_user_with_new_email = crud_user.get_user_by_email(
            db, email=user_in.email
        )
        if existing_user_with_new_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este correo electronico ya esta registrado por otro usuario",
            )

    updated_user = crud_user.update_own_profile(
        db=db, db_user_to_update=current_user, user_in=user_in
    )
    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "username": updated_user.username,
        "is_active": updated_user.is_active,
        "is_admin": updated_user.is_admin,
        "role_id": updated_user.role_id,
        "photo_url": updated_user.photo_url,
        "created_at": updated_user.created_at,
        "permissions": crud_permission.get_effective_permission_codes(
            db, updated_user.id
        ),
    }
