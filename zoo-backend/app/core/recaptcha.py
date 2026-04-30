"""
Módulo para verificación de Google reCAPTCHA v2 (server-side, visible).
"""

from typing import Optional
import httpx
from app.core.config import settings


async def verify_recaptcha(token: str, remote_ip: Optional[str] = None) -> dict:
    """
    Verifica un token de reCAPTCHA v2 con la API de Google.

    Args:
        token: El token generado por el widget de reCAPTCHA en el frontend.
        remote_ip: IP opcional del cliente.

    Returns:
        dict con las claves: success (bool), hostname (str), errors (list)
    """
    if not token:
        return {
            "success": False,
            "hostname": None,
            "errors": ["Token vacío"],
        }

    if settings.RECAPTCHA_SECRET_KEY == "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx":
        # Modo desarrollo: si no se ha configurado la clave real, omitir validación
        # EN PRODUCCIÓN ESTO DEBE SER ELIMINADO O CONFIGURADO CORRECTAMENTE
        return {"success": True, "hostname": "localhost", "errors": []}

    data = {
        "secret": settings.RECAPTCHA_SECRET_KEY,
        "response": token,
    }
    if remote_ip:
        data["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(settings.RECAPTCHA_VERIFY_URL, data=data)
            result = response.json()

            success = result.get("success", False)
            hostname = result.get("hostname", "")
            error_codes = result.get("error-codes", [])

            return {
                "success": success,
                "hostname": hostname,
                "errors": error_codes,
            }
    except Exception as e:
        return {"success": False, "hostname": None, "errors": [str(e)]}


def is_valid_recaptcha(verify_result: dict) -> bool:
    """
    Determina si el resultado de reCAPTCHA v2 es válido.
    Para v2, solo se requiere que success sea True.
    """
    return verify_result.get("success") is True
