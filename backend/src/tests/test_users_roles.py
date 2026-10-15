import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_users_roles.db"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_create_user(client):
    response = client.post(
        "/users/",
        json={
            "username": "juan123",
            "email": "juan@test.com",
            "password": "123456",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["username"] == "juan123"
    assert payload["email"] == "juan@test.com"


def test_login_user(client):
    client.post(
        "/users/",
        json={
            "username": "ana123",
            "email": "ana@test.com",
            "password": "123456",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "ana123",
            "password": "123456",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["username"] == "ana123"
    assert "access_token" in payload


def test_create_role_and_assign_to_user(client):
    role_response = client.post("/roles/", json={"name": "admin"})
    assert role_response.status_code == 201

    user_response = client.post(
        "/users/",
        json={
            "username": "maria",
            "email": "maria@test.com",
            "password": "123456",
            "role_id": 1,
        },
    )

    assert user_response.status_code == 201
    payload = user_response.json()
    assert payload["role_id"] == 1
