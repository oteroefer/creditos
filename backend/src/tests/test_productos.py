PRODUCTO = {
    "codigo": "TV-01",
    "nombre": "Televisor 50 pulgadas",
    "descripcion": "Smart TV 4K",
    "precio": 1500000,
    "stock": 10,
}


def crear_producto(client, headers, **cambios):
    return client.post("/productos/", json={**PRODUCTO, **cambios}, headers=headers)


# Alta


def test_admin_crea_producto(client, headers_admin):
    response = crear_producto(client, headers_admin)

    assert response.status_code == 201
    data = response.json()
    assert data["codigo"] == "TV-01"
    assert data["nombre"] == "Televisor 50 pulgadas"
    assert data["precio"] == 1500000
    assert data["stock"] == 10
    assert data["activo"] is True


def test_codigo_se_normaliza(client, headers_admin):
    response = crear_producto(client, headers_admin, codigo="  tv-02 ")

    assert response.status_code == 201
    assert response.json()["codigo"] == "TV-02"


def test_codigo_duplicado(client, headers_admin):
    crear_producto(client, headers_admin)

    response = crear_producto(client, headers_admin, codigo="tv-01", nombre="Otro")

    assert response.status_code == 409
    assert response.json()["detail"] == "Ya existe un producto con ese código"


def test_precio_debe_ser_positivo(client, headers_admin):
    assert crear_producto(client, headers_admin, precio=0).status_code == 422
    assert crear_producto(client, headers_admin, precio=-100).status_code == 422


def test_precio_con_mas_de_dos_decimales(client, headers_admin):
    response = crear_producto(client, headers_admin, precio=10.555)

    assert response.status_code == 422


def test_stock_no_puede_ser_negativo(client, headers_admin):
    response = crear_producto(client, headers_admin, stock=-1)

    assert response.status_code == 422


def test_nombre_vacio(client, headers_admin):
    response = crear_producto(client, headers_admin, nombre="   ")

    assert response.status_code == 422


def test_cliente_no_puede_crear(client, headers_cliente):
    response = crear_producto(client, headers_cliente)

    assert response.status_code == 403


def test_sin_sesion_no_puede_crear(client):
    response = crear_producto(client, {})

    assert response.status_code == 401


# Listado y detalle


def test_cliente_lista_solo_activos(client, headers_admin, headers_cliente):
    crear_producto(client, headers_admin)
    baja = crear_producto(client, headers_admin, codigo="HEL-01", nombre="Heladera").json()
    client.delete(f"/productos/{baja['id']}", headers=headers_admin)

    response = client.get("/productos/?incluir_inactivos=true", headers=headers_cliente)

    assert response.status_code == 200
    assert [p["codigo"] for p in response.json()] == ["TV-01"]


def test_admin_puede_ver_inactivos(client, headers_admin):
    crear_producto(client, headers_admin)
    baja = crear_producto(client, headers_admin, codigo="HEL-01", nombre="Heladera").json()
    client.delete(f"/productos/{baja['id']}", headers=headers_admin)

    solo_activos = client.get("/productos/", headers=headers_admin).json()
    todos = client.get("/productos/?incluir_inactivos=true", headers=headers_admin).json()

    assert len(solo_activos) == 1
    assert len(todos) == 2


def test_listado_ordenado_por_nombre(client, headers_admin):
    crear_producto(client, headers_admin, codigo="A", nombre="Televisor")
    crear_producto(client, headers_admin, codigo="B", nombre="Heladera")

    response = client.get("/productos/", headers=headers_admin)

    assert [p["nombre"] for p in response.json()] == ["Heladera", "Televisor"]


def test_sin_sesion_no_puede_listar(client):
    response = client.get("/productos/")

    assert response.status_code == 401


def test_ver_detalle(client, headers_admin, headers_cliente):
    producto = crear_producto(client, headers_admin).json()

    response = client.get(f"/productos/{producto['id']}", headers=headers_cliente)

    assert response.status_code == 200
    assert response.json()["codigo"] == "TV-01"


def test_detalle_inexistente(client, headers_cliente):
    response = client.get("/productos/999", headers=headers_cliente)

    assert response.status_code == 404


def test_cliente_no_ve_detalle_de_inactivo(client, headers_admin, headers_cliente):
    producto = crear_producto(client, headers_admin).json()
    client.delete(f"/productos/{producto['id']}", headers=headers_admin)

    assert client.get(f"/productos/{producto['id']}", headers=headers_cliente).status_code == 404
    assert client.get(f"/productos/{producto['id']}", headers=headers_admin).status_code == 200


# Modificación


def test_admin_modifica_precio_y_stock(client, headers_admin):
    producto = crear_producto(client, headers_admin).json()

    response = client.patch(
        f"/productos/{producto['id']}",
        json={"precio": 1800000.50, "stock": 3},
        headers=headers_admin,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["precio"] == 1800000.50
    assert data["stock"] == 3
    assert data["nombre"] == "Televisor 50 pulgadas"


def test_modificar_a_codigo_existente(client, headers_admin):
    crear_producto(client, headers_admin)
    otro = crear_producto(client, headers_admin, codigo="HEL-01", nombre="Heladera").json()

    response = client.patch(
        f"/productos/{otro['id']}", json={"codigo": "TV-01"}, headers=headers_admin
    )

    assert response.status_code == 409


def test_modificar_con_nulo(client, headers_admin):
    producto = crear_producto(client, headers_admin).json()

    response = client.patch(
        f"/productos/{producto['id']}", json={"precio": None}, headers=headers_admin
    )

    assert response.status_code == 422


def test_borrar_descripcion(client, headers_admin):
    producto = crear_producto(client, headers_admin).json()

    response = client.patch(
        f"/productos/{producto['id']}", json={"descripcion": None}, headers=headers_admin
    )

    assert response.status_code == 200
    assert response.json()["descripcion"] is None


def test_modificar_inexistente(client, headers_admin):
    response = client.patch("/productos/999", json={"stock": 1}, headers=headers_admin)

    assert response.status_code == 404


def test_cliente_no_puede_modificar(client, headers_admin, headers_cliente):
    producto = crear_producto(client, headers_admin).json()

    response = client.patch(
        f"/productos/{producto['id']}", json={"stock": 0}, headers=headers_cliente
    )

    assert response.status_code == 403


# Baja


def test_baja_es_logica(client, headers_admin):
    producto = crear_producto(client, headers_admin).json()

    response = client.delete(f"/productos/{producto['id']}", headers=headers_admin)

    assert response.status_code == 204
    detalle = client.get(f"/productos/{producto['id']}", headers=headers_admin).json()
    assert detalle["activo"] is False


def test_reactivar_producto(client, headers_admin):
    producto = crear_producto(client, headers_admin).json()
    client.delete(f"/productos/{producto['id']}", headers=headers_admin)

    response = client.patch(
        f"/productos/{producto['id']}", json={"activo": True}, headers=headers_admin
    )

    assert response.status_code == 200
    assert response.json()["activo"] is True


def test_baja_inexistente(client, headers_admin):
    response = client.delete("/productos/999", headers=headers_admin)

    assert response.status_code == 404


def test_cliente_no_puede_dar_de_baja(client, headers_admin, headers_cliente):
    producto = crear_producto(client, headers_admin).json()

    response = client.delete(f"/productos/{producto['id']}", headers=headers_cliente)

    assert response.status_code == 403


# Imagen


def test_crear_con_imagen(client, headers_admin):
    response = crear_producto(client, headers_admin, imagen_url="https://ejemplo.com/tv.png")

    assert response.status_code == 201
    assert response.json()["imagen_url"] == "https://ejemplo.com/tv.png"


def test_imagen_es_opcional_y_se_puede_borrar(client, headers_admin):
    producto = crear_producto(client, headers_admin, imagen_url="https://ejemplo.com/tv.png").json()

    response = client.patch(
        f"/productos/{producto['id']}", json={"imagen_url": None}, headers=headers_admin
    )

    assert response.status_code == 200
    assert response.json()["imagen_url"] is None
    assert crear_producto(client, headers_admin, codigo="SIN-IMG").json()["imagen_url"] is None
