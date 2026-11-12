"""Tabla de ventas."""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.productos.models import Product
from app.usuarios.models import User


class Venta(Base):
    """Venta de un producto a un cliente, hecha por un vendedor o administrador.

    Guarda el precio y el total del momento, así un cambio posterior de precio en el
    catálogo no altera las ventas ya registradas. Si fue a crédito, guarda las cuotas,
    la tasa y la cuota mensual; si no, esos campos quedan en null.
    """

    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vendedor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(12, 2), nullable=False)
    cuotas = Column(Integer, nullable=True)
    tasa_anual = Column(Numeric(7, 2), nullable=True)
    cuota_mensual = Column(Numeric(12, 2), nullable=True)
    fecha = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    cliente = relationship(User, foreign_keys=[cliente_id])
    vendedor = relationship(User, foreign_keys=[vendedor_id])
    producto = relationship(Product)
