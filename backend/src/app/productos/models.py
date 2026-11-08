"""Tabla de productos del catálogo."""

from sqlalchemy import Boolean, Column, Integer, Numeric, String

from app.core.database import Base


class Product(Base):
    """Producto del catálogo que se puede vender a crédito.

    Los productos no se borran de la base: al eliminarlos quedan con activo en False,
    para que los créditos que los usen sigan apuntando a un registro existente.
    """

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(30), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(500), nullable=True)
    precio = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    imagen_url = Column(String(500), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
