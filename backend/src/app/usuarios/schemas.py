"""Formatos de los datos de usuarios que la API recibe y devuelve."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr

from app.roles.schemas import RoleOut


class UserCreate(BaseModel):
    """Datos para registrar un usuario nuevo.

    El rol predeterminado es cliente. El rol admin no se acepta en el registro:
    solo se asigna con bootstrap_admin o desde el panel de administración.
    """

    username: str
    email: EmailStr
    password: str
    role: Literal["cliente", "vendedor"] = "cliente"


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
