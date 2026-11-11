import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.core.database as database

# Base SQLite en memoria para no depender de PostgreSQL.
# Se reemplaza el engine antes de importar app.main (que hace create_all al importarse).
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
database.engine = test_engine

from app.main import app  # noqa: E402
from app.roles.models import Role  # noqa: E402
from app.usuarios.models import User  # noqa: E402


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[database.get_db] = override_get_db


@pytest.fixture
def client():
    database.Base.metadata.create_all(bind=test_engine)
    with TestClient(app) as c:
        yield c
    database.Base.metadata.drop_all(bind=test_engine)


def _registrar_y_loguear(client, username):
    """Registra un usuario (queda como cliente), inicia sesión y devuelve su token."""
    client.post(
        "/users/",
        json={"username": username, "email": f"{username}@example.com", "password": "secreta123"},
    )
    response = client.post("/auth/login", json={"username": username, "password": "secreta123"})
    return response.json()["access_token"]


@pytest.fixture
def headers_cliente(client):
    """Encabezados de autorización de un usuario con rol cliente."""
    token = _registrar_y_loguear(client, "cliente1")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def headers_admin(client):
    """Encabezados de autorización de un usuario con rol admin.

    El registro no permite elegir admin, así que el rol se asigna directo en la base,
    igual que lo hace bootstrap_admin.
    """
    token = _registrar_y_loguear(client, "admin1")
    with TestingSessionLocal() as db:
        admin_role = Role(name="admin")
        db.add(admin_role)
        db.query(User).filter(User.username == "admin1").one().role = admin_role
        db.commit()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def headers_vendedor(client):
    """Encabezados de autorización de un usuario con rol vendedor (se asigna en la base)."""
    token = _registrar_y_loguear(client, "vendedor1")
    with TestingSessionLocal() as db:
        rol = db.query(Role).filter(Role.name == "vendedor").first() or Role(name="vendedor")
        db.add(rol)
        db.query(User).filter(User.username == "vendedor1").one().role = rol
        db.commit()
    return {"Authorization": f"Bearer {token}"}
