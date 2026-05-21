"""
Modulo para verificacion server-side de Google reCAPTCHA v2.
"""

from typing import Optional
import httpx
from app.core.config import settings


async def verify_recaptcha(token: str, remote_ip: Optional[str] = None) -> dict:
    """
    Verifica un token de reCAPTCHA v2 con la API de Google.
    """
    if not token:
        return {
            "success": False,
            "hostname": None,
            "errors": ["Token vacio"],
        }

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

            return {
                "success": result.get("success", False),
                "hostname": result.get("hostname", ""),
                "errors": result.get("error-codes", []),
            }
    except Exception as e:
        return {"success": False, "hostname": None, "errors": [str(e)]}


def is_valid_recaptcha(verify_result: dict) -> bool:
    """
    Determina si el resultado de reCAPTCHA v2 es valido.
    """
    return verify_result.get("success") is True
