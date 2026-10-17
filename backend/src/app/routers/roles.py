"""Rutas de roles: listar, crear, renombrar y eliminar. Solo para administradores."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.models import Role, User
from app.schemas import RoleCreate, RoleOut

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Lista todos los roles ordenados por nombre."""
    return db.query(Role).order_by(Role.name).all()


@router.post("/", response_model=RoleOut, status_code=201)
def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Crea un rol nuevo. Responde 409 si ya existe un rol con ese nombre."""
    name = role_data.name.strip().lower()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="El nombre del rol debe tener al menos 2 caracteres")

    role = Role(name=name)
    db.add(role)
    try:
        db.commit()
        db.refresh(role)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El rol ya existe")
    return role


@router.patch("/{role_id}", response_model=RoleOut)
def update_role(
    role_id: int,
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Cambia el nombre de un rol. El rol admin no se puede renombrar."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if len(role_data.name) < 2:
        raise HTTPException(status_code=422, detail="El nombre del rol debe tener al menos 2 caracteres")
    if role.name == "admin" and role_data.name != "admin":
        raise HTTPException(status_code=400, detail="No se puede modificar el rol admin")

    role.name = role_data.name
    try:
        db.commit()
        db.refresh(role)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El rol ya existe")
    return role


@router.delete("/{role_id}", status_code=204)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Elimina un rol. No se puede eliminar el rol admin ni un rol asignado a usuarios."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if role.name == "admin":
        raise HTTPException(status_code=400, detail="No se puede eliminar el rol admin")
    if db.query(User).filter(User.role_id == role_id).first() is not None:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar un rol asignado a usuarios",
        )

    db.delete(role)
    db.commit()
