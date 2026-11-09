"""Formatos de los datos de usuarios que la API recibe y devuelve."""

from pydantic import BaseModel, ConfigDict, EmailStr

from app.roles.schemas import RoleOut


class UserCreate(BaseModel):
    """Datos para registrar un usuario nuevo.

    No se elige rol: toda cuenta nueva queda como cliente. Los roles vendedor y admin
    solo los asigna un administrador (o bootstrap_admin para el primer admin).
    """

    username: str
    email: EmailStr
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
