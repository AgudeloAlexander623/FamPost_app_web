"""Endpoints de fotos (ejemplo basico, la logica va en el servicio)."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.photo import PhotoCreate, PhotoRead
from app.services.photo_service import photo_service

router = APIRouter()


@router.get("/", response_model=list[PhotoRead])
async def list_photos() -> list[PhotoRead]:
    """Lista todas las fotos."""
    return await photo_service.list_photos()


@router.get("/{photo_id}", response_model=PhotoRead)
async def get_photo(photo_id: str) -> PhotoRead:
    """Obtiene una foto por su id."""
    photo = await photo_service.get_photo(photo_id)
    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Foto no encontrada: {photo_id}",
        )
    return photo


@router.post("/", response_model=PhotoRead, status_code=status.HTTP_201_CREATED)
async def create_photo(payload: PhotoCreate) -> PhotoRead:
    """Crea una foto nueva."""
    return await photo_service.create_photo(payload)
