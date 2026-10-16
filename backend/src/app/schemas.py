from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RoleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, name: str) -> str:
        return name.strip().lower()


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Literal["cliente", "vendedor", "admin"] = "cliente" #Rol predeterminado es cliente.

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: RoleOut | None


class UserRoleUpdate(BaseModel):
    role_id: int | None