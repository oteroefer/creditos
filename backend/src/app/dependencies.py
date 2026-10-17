"""Permisos de las rutas: obtener el usuario que inició sesión y exigir rol admin."""

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import ALGORITHM, SECRET_KEY

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Devuelve el usuario dueño del token enviado en la petición.

    Responde 401 si no hay token, si es inválido o vencido, o si el usuario ya no existe.
    """
    unauthorized = HTTPException(
        status_code=401,
        detail="Autenticación requerida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
    except jwt.InvalidTokenError:
        raise unauthorized

    if not isinstance(user_id, int):
        raise unauthorized

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise unauthorized
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Devuelve el usuario si tiene rol admin; si no, responde 403."""
    if user.role is None or user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Se requiere el rol de administrador")
    return user
