"""Pruebas del módulo de simulación: cálculo del plan y ruta POST /simulacion/."""

from decimal import Decimal

from app.simulacion.servicio import calcular_plan

DATOS = {"monto": "1200000", "tasa_anual": "12", "cuotas": 12}


def test_calcular_plan_cuota_conocida():
    """1.200.000 al 12 % en 12 cuotas da una cuota de 106.618,55 y saldo final 0."""
    r = calcular_plan(Decimal("1200000"), Decimal("12"), 12)
    assert r["cuota_mensual"] == Decimal("106618.55")
    assert len(r["plan"]) == 12
    assert r["plan"][-1]["saldo"] == 0
    assert r["total_a_pagar"] - r["total_intereses"] == Decimal("1200000")


def test_calcular_plan_tasa_cero():
    """Con tasa 0 no hay intereses y la cuota es monto / cuotas."""
    r = calcular_plan(Decimal("1000"), Decimal("0"), 4)
    assert r["cuota_mensual"] == Decimal("250.00")
    assert r["total_intereses"] == 0
    assert r["plan"][-1]["saldo"] == 0


def test_calcular_plan_una_cuota():
    """Con una sola cuota se paga el monto más un mes de interés."""
    r = calcular_plan(Decimal("1000"), Decimal("12"), 1)
    assert r["total_a_pagar"] == Decimal("1010.00")
    assert r["plan"][0]["saldo"] == 0


def test_simular_requiere_sesion(client):
    assert client.post("/simulacion/", json=DATOS).status_code == 401


def test_simular_ok(client, headers_cliente):
    r = client.post("/simulacion/", json=DATOS, headers=headers_cliente)
    assert r.status_code == 200
    cuerpo = r.json()
    assert Decimal(cuerpo["cuota_mensual"]) == Decimal("106618.55")
    assert len(cuerpo["plan"]) == 12
    assert Decimal(cuerpo["plan"][-1]["saldo"]) == 0


def test_simular_datos_invalidos(client, headers_cliente):
    for malo in (
        {**DATOS, "monto": "0"},
        {**DATOS, "monto": "-5"},
        {**DATOS, "tasa_anual": "-1"},
        {**DATOS, "cuotas": 0},
        {**DATOS, "cuotas": 121},
    ):
        assert client.post("/simulacion/", json=malo, headers=headers_cliente).status_code == 422
