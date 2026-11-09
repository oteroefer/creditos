"""Formatos de los datos de autenticación que la API recibe."""

from pydantic import BaseModel


class UserLogin(BaseModel):
    """Datos para iniciar sesión."""

    username: str
    password: str
