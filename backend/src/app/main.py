from fastapi import FastAPI
from app.database import Base, engine
from app.routers import users, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Software de Ventas")

app.include_router(users.router)
app.include_router(auth.router)