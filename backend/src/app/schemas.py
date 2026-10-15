from pydantic import BaseModel, ConfigDict, EmailStr


class RoleCreate(BaseModel):
    name: str


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_id: int | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role_id: int | None = None