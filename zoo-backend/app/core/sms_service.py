import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class SmsServiceNotConfigured(RuntimeError):
    pass


def _assert_twilio_configured() -> None:
    if not (
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_VERIFY_SERVICE_SID
    ):
        raise SmsServiceNotConfigured("Twilio Verify no esta configurado")


def _verify_url(action: str) -> str:
    return (
        "https://verify.twilio.com/v2/Services/"
        f"{settings.TWILIO_VERIFY_SERVICE_SID}/{action}"
    )


async def start_phone_verification(phone_number: str) -> None:
    _assert_twilio_configured()
    async with httpx.AsyncClient(
        auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
        timeout=10.0,
    ) as client:
        response = await client.post(
            _verify_url("Verifications"),
            data={"To": phone_number, "Channel": "sms"},
        )
    if response.status_code not in (200, 201):
        logger.error("Twilio Verify start failed: %s %s", response.status_code, response.text)
        raise RuntimeError("No se pudo enviar el codigo SMS")


async def check_phone_verification(phone_number: str, code: str) -> bool:
    _assert_twilio_configured()
    async with httpx.AsyncClient(
        auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
        timeout=10.0,
    ) as client:
        response = await client.post(
            _verify_url("VerificationCheck"),
            data={"To": phone_number, "Code": code},
        )
    if response.status_code not in (200, 201):
        logger.warning("Twilio Verify check failed: %s %s", response.status_code, response.text)
        return False
    return response.json().get("status") == "approved"
