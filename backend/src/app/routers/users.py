from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Role, User
from app.schemas import UserCreate, UserOut
from app.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserOut, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if user.role_id is not None:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if role is None:
            raise HTTPException(status_code=400, detail="Rol no encontrado")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role_id=user.role_id,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Usuario o email ya existe")
    return new_user