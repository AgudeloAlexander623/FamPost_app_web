"""Logica de negocio de fotos.

Por ahora los datos viven en memoria. Cuando se conecte la base de datos
(SQLAlchemy ya esta en requirements.txt) se reemplaza este repositorio.
"""

from datetime import UTC, datetime
from uuid import uuid4

from app.schemas.photo import PhotoCreate, PhotoRead


class PhotoService:
    """Servicio de fotos con almacenamiento en memoria."""

    def __init__(self) -> None:
        self._photos: dict[str, PhotoRead] = {}

    async def list_photos(self) -> list[PhotoRead]:
        return list(self._photos.values())

    async def get_photo(self, photo_id: str) -> PhotoRead | None:
        return self._photos.get(photo_id)

    async def create_photo(self, payload: PhotoCreate) -> PhotoRead:
        photo = PhotoRead(
            id=str(uuid4()),
            title=payload.title,
            url=payload.url,
            description=payload.description,
            created_at=datetime.now(UTC),
        )
        self._photos[photo.id] = photo
        return photo

    async def delete_photo(self, photo_id: str) -> bool:
        return self._photos.pop(photo_id, None) is not None


photo_service = PhotoService()
