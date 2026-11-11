"""Punto de entrada de la API: crea las tablas y registra todas las rutas."""

from fastapi import FastAPI
from app.core.database import Base, engine, ensure_product_schema, ensure_role_schema
from app.auth.router import router as auth_router
from app.productos.router import router as productos_router
from app.roles.router import router as roles_router
from app.simulacion.router import router as simulacion_router
from app.usuarios.router import router as usuarios_router
from app.ventas.router import router as ventas_router

Base.metadata.create_all(bind=engine)
ensure_role_schema()
ensure_product_schema()

app = FastAPI(title="Software de Ventas")

app.include_router(usuarios_router)
app.include_router(auth_router)
app.include_router(roles_router)
app.include_router(productos_router)
app.include_router(simulacion_router)
app.include_router(ventas_router)
