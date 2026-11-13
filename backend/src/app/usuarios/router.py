"""Rutas de usuarios: registro, listado y asignación de roles."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.roles.models import Role
from app.usuarios.models import User
from app.usuarios.schemas import UserCreate, UserOut, UserRoleUpdate
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])

ROLES_VENDEDORES = ("vendedor", "admin")


def require_vendedor_o_admin(user: User = Depends(get_current_user)) -> User:
    """Devuelve el usuario si es vendedor o admin; si no, responde 403."""
    if user.role is None or user.role.name not in ROLES_VENDEDORES:
        raise HTTPException(status_code=403, detail="Se requiere el rol de vendedor o administrador")
    return user


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Lista todos los usuarios. Solo para administradores."""
    return db.query(User).order_by(User.id).all()


@router.get("/clientes", response_model=list[UserOut])
def list_clientes(db: Session = Depends(get_db), _: User = Depends(require_vendedor_o_admin)):
    """Lista solo los usuarios con rol cliente. Para vendedores y administradores."""
    return (
        db.query(User)
        .join(Role)
        .filter(Role.name == "cliente")
        .order_by(User.username)
        .all()
    )


@router.post("/", response_model=UserOut, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registra un usuario nuevo con el rol cliente.

    Si el rol cliente todavía no existe en la base de datos, lo crea. Responde 400 si
    el usuario o el email ya están registrados.
    """
    role = db.query(Role).filter(Role.name == "cliente").first()
    if role is None:
        role = Role(name="cliente")
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