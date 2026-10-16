from fastapi import FastAPI
from app.database import Base, engine, ensure_role_schema
from app.routers import auth, roles, users

Base.metadata.create_all(bind=engine)
ensure_role_schema()

app = FastAPI(title="Software de Ventas")

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(roles.router)