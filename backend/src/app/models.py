"""Tablas de la base de datos: usuarios y roles."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    """Rol que puede tener un usuario, por ejemplo cliente, vendedor o admin."""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="role")


class User(Base):
    """Usuario registrado en el sistema, con su contraseña encriptada y su rol."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    role = relationship("Role", back_populates="users")
