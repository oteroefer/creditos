import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.database as database

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
