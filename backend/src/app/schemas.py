"""Formatos de los datos que la API recibe y devuelve."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


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


class UserCreate(BaseModel):
    """Datos para registrar un usuario nuevo.

    El rol predeterminado es cliente. El rol admin no se acepta en el registro:
    solo se asigna con bootstrap_admin o desde el panel de administración.
    """

    username: str
    email: EmailStr
    password: str
    role: Literal["cliente", "vendedor"] = "cliente"

class UserLogin(BaseModel):
    """Datos para iniciar sesión."""

    username: str
    password: str

class UserOut(BaseModel):
    """Usuario tal como lo devuelve la API, sin la contraseña."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: RoleOut | None


class UserRoleUpdate(BaseModel):
    """Rol nuevo que se le asigna a un usuario. None le quita el rol."""

    role_id: int | None
