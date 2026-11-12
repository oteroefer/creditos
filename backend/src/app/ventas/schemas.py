"""Formatos de los datos de ventas que la API recibe y devuelve."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class VentaCreate(BaseModel):
    """Datos para registrar una venta. Con cuotas y tasa_anual la venta es a crédito."""

    cliente_id: int
    producto_id: int
    cantidad: int = Field(default=1, ge=1)
    cuotas: int | None = Field(default=None, ge=1, le=120)
    tasa_anual: Decimal | None = Field(default=None, ge=0, le=1000, max_digits=7, decimal_places=2)

    @model_validator(mode="after")
    def credito_completo(self):
        """Exige enviar cuotas y tasa_anual juntas o ninguna de las dos."""
        if (self.cuotas is None) != (self.tasa_anual is None):
            raise ValueError("Para vender a crédito hay que enviar cuotas y tasa_anual")
        return self


class VentaOut(BaseModel):
    """Venta registrada."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    cliente_id: int
    vendedor_id: int
    producto_id: int
    cantidad: int
    precio_unitario: Decimal
    total: Decimal
    cuotas: int | None
    tasa_anual: Decimal | None
    cuota_mensual: Decimal | None
    fecha: datetime
