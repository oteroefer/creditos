"""Cálculo del plan de pagos de un crédito con el sistema francés.

Es lógica pura (sin base de datos ni FastAPI) para poder probarla y reutilizarla,
por ejemplo desde el módulo de ventas.
"""

from decimal import ROUND_HALF_UP, Decimal

CENTAVOS = Decimal("0.01")


def redondear(valor: Decimal) -> Decimal:
    """Redondea un monto a 2 decimales (mitad hacia arriba)."""
    return valor.quantize(CENTAVOS, rounding=ROUND_HALF_UP)


def calcular_cuota(monto: Decimal, tasa_anual: Decimal, cuotas: int) -> Decimal:
    """Calcula la cuota mensual fija sin redondear.

    La tasa anual viene en porcentaje y se divide en 12 para obtener la tasa mensual.
    Con tasa 0 la cuota es simplemente monto / cuotas.
    """
    tasa_mensual = tasa_anual / Decimal(100) / Decimal(12)
    if tasa_mensual == 0:
        return monto / cuotas
    factor = (1 + tasa_mensual) ** cuotas
    return monto * tasa_mensual * factor / (factor - 1)


def calcular_plan(monto: Decimal, tasa_anual: Decimal, cuotas: int) -> dict:
    """Devuelve la cuota mensual, el total a pagar, los intereses y el plan de pagos.

    Cada fila del plan trae numero, cuota, interes, capital y saldo. La última cuota
    se ajusta para absorber el redondeo, de modo que el saldo final sea exactamente 0.
    """
    monto = Decimal(monto)
    tasa_anual = Decimal(tasa_anual)
    cuota = redondear(calcular_cuota(monto, tasa_anual, cuotas))
    tasa_mensual = tasa_anual / Decimal(100) / Decimal(12)

    saldo = monto
    plan = []
    total = Decimal("0")
    for numero in range(1, cuotas + 1):
        interes = redondear(saldo * tasa_mensual)
        if numero == cuotas:
            capital = saldo
            valor = capital + interes
        else:
            valor = cuota
            capital = valor - interes
        saldo = saldo - capital
        total += valor
        plan.append(
            {"numero": numero, "cuota": valor, "interes": interes, "capital": capital, "saldo": saldo}
        )

    return {
        "cuota_mensual": cuota,
        "total_a_pagar": total,
        "total_intereses": total - monto,
        "plan": plan,
    }
