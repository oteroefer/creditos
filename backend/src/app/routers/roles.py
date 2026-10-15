from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Role
from app.schemas import RoleCreate, RoleOut

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


@router.post("/", response_model=RoleOut, status_code=201)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    role_exists = db.query(Role).filter(Role.name == role.name).first()
    if role_exists:
        raise HTTPException(status_code=400, detail="El rol ya existe")

    new_role = Role(name=role.name)
    db.add(new_role)
    try:
        db.commit()
        db.refresh(new_role)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se pudo crear el rol")
    return new_role
