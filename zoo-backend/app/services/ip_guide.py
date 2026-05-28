import logging
from functools import lru_cache
from ipaddress import ip_address
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)


PRIVATE_IP_LABEL = "Red privada/local"
IP_GUIDE_TIMEOUT_SECONDS = 1.5


def _is_lookup_allowed(ip: str) -> bool:
    try:
        parsed_ip = ip_address(ip)
    except ValueError:
        return False

    return not (
        parsed_ip.is_private
        or parsed_ip.is_loopback
        or parsed_ip.is_link_local
        or parsed_ip.is_multicast
        or parsed_ip.is_reserved
        or parsed_ip.is_unspecified
    )


@lru_cache(maxsize=512)
def lookup_ip(ip: str) -> dict[str, Any]:
    if not _is_lookup_allowed(ip):
        return {
            "ip": ip,
            "location": {"country": PRIVATE_IP_LABEL},
            "lookup_skipped": "private_or_local_ip",
        }

    try:
        response = httpx.get(
            f"https://ip.guide/{ip}",
            timeout=IP_GUIDE_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, dict) else {"ip": ip}
    except Exception as exc:
        logger.warning("No se pudo consultar ip.guide para %s: %s", ip, exc)
        return {"ip": ip, "lookup_error": str(exc)}


def summarize_ip_guide(data: Optional[dict[str, Any]]) -> dict[str, Any]:
    if not data:
        return {}

    location = data.get("location") if isinstance(data.get("location"), dict) else {}
    network = data.get("network") if isinstance(data.get("network"), dict) else {}
    autonomous_system = (
        network.get("autonomous_system")
        if isinstance(network.get("autonomous_system"), dict)
        else {}
    )

    return {
        "country": location.get("country"),
        "asn": autonomous_system.get("asn"),
        "organization": autonomous_system.get("organization") or autonomous_system.get("name"),
    }
