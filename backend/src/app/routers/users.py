"""Rutas de usuarios: registro, listado y asignación de roles."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.dependencies import require_admin
from app.models import Role, User
from app.schemas import UserCreate, UserOut, UserRoleUpdate
from app.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Lista todos los usuarios. Solo para administradores."""
    return db.query(User).order_by(User.id).all()


@router.post("/", response_model=UserOut, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registra un usuario nuevo con el rol elegido.

    Si el rol todavía no existe en la base de datos, lo crea. Responde 400 si el
    usuario o el email ya están registrados.
    """
    role = db.query(Role).filter(Role.name == user.role).first()
    if role is None:
        role = Role(name=user.role)
        db.add(role)

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=role,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Usuario o email ya existe")
    return new_user


@router.patch("/{user_id}/role", response_model=UserOut)
def assign_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Cambia o quita el rol de un usuario. Solo para administradores.

    No permite quitarle el rol admin al último administrador.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    role = None
    if role_update.role_id is not None:
        role = db.query(Role).filter(Role.id == role_update.role_id).first()
        if role is None:
            raise HTTPException(status_code=404, detail="Rol no encontrado")

    if user.role and user.role.name == "admin" and (role is None or role.name != "admin"):
        admin_count = db.query(User).join(Role).filter(Role.name == "admin").count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="No se puede quitar el rol al último administrador",
            )

    user.role = role
    db.commit()
    db.refresh(user)
    return user
