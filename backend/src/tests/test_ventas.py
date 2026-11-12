"""Pruebas del módulo de ventas: POST /ventas/ y GET /ventas/."""

from decimal import Decimal

import pytest

PRODUCTO = {"codigo": "TV-01", "nombre": "Televisor", "precio": "500000.00", "stock": 5}


@pytest.fixture
def producto(client, headers_admin):
    """Crea un producto con stock 5 y devuelve su JSON."""
    return client.post("/productos/", json=PRODUCTO, headers=headers_admin).json()


@pytest.fixture
def cliente_id(client, headers_cliente):
    """Id del usuario cliente1, buscado directo en la base de pruebas."""
    from tests.conftest import TestingSessionLocal
    from app.usuarios.models import User

    with TestingSessionLocal() as db:
        return db.query(User).filter(User.username == "cliente1").one().id


def vender(client, headers, cliente_id, producto_id, **extra):
    return client.post(
        "/ventas/",
        json={"cliente_id": cliente_id, "producto_id": producto_id, **extra},
        headers=headers,
    )


def test_venta_sin_sesion(client):
    assert client.post("/ventas/", json={"cliente_id": 1, "producto_id": 1}).status_code == 401


def test_cliente_no_puede_vender(client, headers_cliente, producto, cliente_id):
    r = vender(client, headers_cliente, cliente_id, producto["id"])
    assert r.status_code == 403


def test_vendedor_vende_y_descuenta_stock(client, headers_vendedor, headers_admin, producto, cliente_id):
    r = vender(client, headers_vendedor, cliente_id, producto["id"], cantidad=2)
    assert r.status_code == 201
    venta = r.json()
    assert Decimal(venta["total"]) == Decimal("1000000.00")
    assert Decimal(venta["precio_unitario"]) == Decimal("500000.00")
    assert venta["cuota_mensual"] is None
    stock = client.get(f"/productos/{producto['id']}", headers=headers_admin).json()["stock"]
    assert stock == 3


def test_venta_a_credito_calcula_cuota(client, headers_admin, producto, cliente_id):
    r = vender(client, headers_admin, cliente_id, producto["id"], cuotas=12, tasa_anual="12")
    assert r.status_code == 201
    venta = r.json()
    assert venta["cuotas"] == 12
    assert Decimal(venta["cuota_mensual"]) > Decimal("500000") / 12


def test_credito_incompleto_es_422(client, headers_admin, producto, cliente_id):
    r = vender(client, headers_admin, cliente_id, producto["id"], cuotas=12)
    assert r.status_code == 422


def test_stock_insuficiente_409(client, headers_admin, producto, cliente_id):
    r = vender(client, headers_admin, cliente_id, producto["id"], cantidad=6)
    assert r.status_code == 409


def test_cliente_inexistente_404(client, headers_admin, producto):
    assert vender(client, headers_admin, 9999, producto["id"]).status_code == 404


def test_producto_inexistente_o_inactivo_404(client, headers_admin, producto, cliente_id):
    assert vender(client, headers_admin, cliente_id, 9999).status_code == 404
    client.delete(f"/productos/{producto['id']}", headers=headers_admin)
    assert vender(client, headers_admin, cliente_id, producto["id"]).status_code == 404


def test_listado_segun_rol(client, headers_admin, headers_cliente, producto, cliente_id):
    vender(client, headers_admin, cliente_id, producto["id"])
    # Otro cliente que no compró nada.
    client.post("/users/", json={"username": "otro", "email": "otro@example.com", "password": "secreta123"})
    token = client.post("/auth/login", json={"username": "otro", "password": "secreta123"}).json()["access_token"]
    headers_otro = {"Authorization": f"Bearer {token}"}

    assert len(client.get("/ventas/", headers=headers_admin).json()) == 1
    assert len(client.get("/ventas/", headers=headers_cliente).json()) == 1
    assert client.get("/ventas/", headers=headers_otro).json() == []
    assert client.get("/ventas/").status_code == 401
