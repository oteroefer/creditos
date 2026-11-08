"""Formatos de los datos de roles que la API recibe y devuelve."""

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RoleCreate(BaseModel):
    """Datos para crear o renombrar un rol."""

    name: str = Field(min_length=2, max_length=50)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, name: str) -> str:
        """Quita espacios al principio y al final y pasa el nombre a minúsculas."""
        return name.strip().lower()


class RoleOut(BaseModel):
    """Rol tal como lo devuelve la API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
