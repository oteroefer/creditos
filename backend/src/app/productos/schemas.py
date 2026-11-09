"""Formatos de los datos de productos que la API recibe y devuelve."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _normalizar_codigo(codigo: str) -> str:
    """Quita espacios y pasa el código a mayúsculas, así " tv-01" y "TV-01" son el mismo."""
    codigo = codigo.strip().upper()
    if not codigo:
        raise ValueError("El código no puede estar vacío")
    return codigo


def _normalizar_nombre(nombre: str) -> str:
    """Quita espacios al principio y al final del nombre."""
    nombre = nombre.strip()
    if len(nombre) < 2:
        raise ValueError("El nombre debe tener al menos 2 caracteres")
    return nombre


class ProductCreate(BaseModel):
    """Datos para dar de alta un producto en el catálogo."""

    codigo: str = Field(min_length=1, max_length=30)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)
    precio: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stock: int = Field(default=0, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)

    @field_validator("codigo")
    @classmethod
    def normalize_codigo(cls, codigo: str) -> str:
        """Normaliza el código del producto."""
        return _normalizar_codigo(codigo)

    @field_validator("nombre")
    @classmethod
    def normalize_nombre(cls, nombre: str) -> str:
        """Normaliza el nombre del producto."""
        return _normalizar_nombre(nombre)


class ProductUpdate(BaseModel):
    """Datos para modificar un producto. Solo se cambian los campos enviados."""

    codigo: str | None = Field(default=None, min_length=1, max_length=30)
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)
    precio: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    stock: int | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    activo: bool | None = None

    @field_validator("codigo")
    @classmethod
    def normalize_codigo(cls, codigo: str | None) -> str | None:
        """Normaliza el código si se envió."""
        return None if codigo is None else _normalizar_codigo(codigo)

    @field_validator("nombre")
    @classmethod
    def normalize_nombre(cls, nombre: str | None) -> str | None:
        """Normaliza el nombre si se envió."""
        return None if nombre is None else _normalizar_nombre(nombre)


class ProductOut(BaseModel):
    """Producto tal como lo devuelve la API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nombre: str
    descripcion: str | None
    precio: float
    stock: int
    imagen_url: str | None
    activo: bool
