from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:postgre123@localhost:5432/ventas_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_role_schema():
    if not inspect(engine).has_table("users"):
        return

    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "role_id" in columns:
        return

    statement = "ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id)"
    if engine.dialect.name == "postgresql":
        statement = "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id)"

    with engine.begin() as connection:
        connection.execute(text(statement))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()