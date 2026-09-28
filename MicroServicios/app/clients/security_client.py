"""Cliente HTTP hacia el servicio de seguridad (Java)."""

import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SecurityClient:
    """Valida credenciales contra el microservicio de seguridad."""

    def __init__(self, base_url: str | None = None, timeout: float = 8.0) -> None:
        self._base_url = base_url or settings.security_service_url
        self._timeout = timeout

    async def login(self, username: str, password: str) -> dict | None:
        """Devuelve el token si las credenciales son validas, None si no."""
        try:
            async with httpx.AsyncClient(base_url=self._base_url, timeout=self._timeout) as client:
                response = await client.post(
                    "/login",
                    json={"username": username, "password": password},
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except httpx.HTTPError as error:
            logger.warning("No se pudo contactar con el servicio de seguridad: %s", error)
            return None


security_client = SecurityClient()
