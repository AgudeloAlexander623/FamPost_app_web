"""Configuracion del microservicio, leida desde variables de entorno."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Valores de configuracion del microservicio."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "photos-service"
    app_version: str = "0.1.0"
    debug: bool = True

    host: str = "0.0.0.0"
    port: int = 8000

    backend_url: str = "http://localhost:4000"
    security_service_url: str = "http://localhost:8080/api/auth"

    database_url: str = "sqlite+aiosqlite:///./photos.db"


@lru_cache
def get_settings() -> Settings:
    """Devuelve la configuracion cacheada (una sola instancia)."""
    return Settings()
