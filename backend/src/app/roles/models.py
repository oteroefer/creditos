"""Tabla de roles."""

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Role(Base):
    """Rol que puede tener un usuario, por ejemplo cliente, vendedor o admin."""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)

    # "User" se resuelve por nombre porque está definido en app.usuarios.models.
    users = relationship("User", back_populates="role")
