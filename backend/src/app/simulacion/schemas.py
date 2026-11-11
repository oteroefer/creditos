"""Formatos de los datos de la simulación que la API recibe y devuelve."""

from decimal import Decimal

from pydantic import BaseModel, Field


class SimulacionIn(BaseModel):
    """Datos para simular un crédito."""

    monto: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    tasa_anual: Decimal = Field(ge=0, le=1000, max_digits=7, decimal_places=2)
    cuotas: int = Field(ge=1, le=120)


class CuotaOut(BaseModel):
    """Una fila del plan de pagos."""

    numero: int
    cuota: Decimal
    interes: Decimal
    capital: Decimal
    saldo: Decimal


class SimulacionOut(BaseModel):
    """Resultado de la simulación: cuota fija, totales y plan de pagos."""

    monto: Decimal
    tasa_anual: Decimal
    cuotas: int
    cuota_mensual: Decimal
    total_a_pagar: Decimal
    total_intereses: Decimal
    plan: list[CuotaOut]
