"""Esquemas Pydantic de fotos."""

from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class PhotoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    url: HttpUrl
    description: str | None = Field(default=None, max_length=500)


class PhotoCreate(PhotoBase):
    """Datos de entrada para crear una foto."""


class PhotoRead(PhotoBase):
    """Datos de salida de una foto."""

    model_config = {"from_attributes": True}

    id: str
    created_at: datetime
