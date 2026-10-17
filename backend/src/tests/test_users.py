USUARIO = {"username": "fer", "email": "fer@example.com", "password": "secreta123"}


def crear_usuario(client, **cambios):
    return client.post("/users/", json={**USUARIO, **cambios})


def test_crear_usuario(client):
    response = crear_usuario(client)

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "fer"
    assert data["email"] == "fer@example.com"
    assert data["role"]["name"] == "cliente"
    assert "password" not in data
    assert "hashed_password" not in data


def test_crear_usuario_duplicado(client):
    crear_usuario(client)

    response = crear_usuario(client, email="otro@example.com")

    assert response.status_code == 400
    assert response.json()["detail"] == "Usuario o email ya existe"


def test_crear_usuario_email_invalido(client):
    response = crear_usuario(client, email="no-es-un-email")

    assert response.status_code == 422


def test_login_exitoso(client):
    crear_usuario(client)

    response = client.post("/auth/login", json={"username": "fer", "password": "secreta123"})

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "fer"
    assert data["token_type"] == "bearer"
    assert data["access_token"]


def test_login_password_incorrecta(client):
    crear_usuario(client)

    response = client.post("/auth/login", json={"username": "fer", "password": "mala"})

    assert response.status_code == 401


def test_login_usuario_inexistente(client):
    response = client.post("/auth/login", json={"username": "nadie", "password": "x"})

    assert response.status_code == 401


def test_crear_usuario_con_rol_elegido(client):
    response = crear_usuario(client, role="vendedor")

    assert response.status_code == 201
    assert response.json()["role"]["name"] == "vendedor"


def test_crear_usuario_rol_invalido(client):
    response = crear_usuario(client, role="inventado")

    assert response.status_code == 422


def test_no_se_puede_registrar_como_admin(client):
    response = crear_usuario(client, role="admin")

    assert response.status_code == 422
