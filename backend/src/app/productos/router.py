"""Rutas del catálogo de productos.

Cualquier usuario con sesión iniciada puede ver los productos activos. Solo los
administradores pueden crear, modificar, eliminar o ver los productos inactivos.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.productos.models import Product
from app.usuarios.models import User
from app.productos.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/productos", tags=["productos"])


def es_admin(user: User) -> bool:
    """Indica si el usuario tiene el rol admin."""
    return user.role is not None and user.role.name == "admin"


def buscar_producto(product_id: int, db: Session) -> Product:
    """Devuelve el producto con ese id o responde 404 si no existe."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


def guardar(product: Product, db: Session) -> Product:
    """Guarda los cambios del producto. Responde 409 si el código ya lo usa otro producto."""
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un producto con ese código")
    return product


@router.get("/", response_model=list[ProductOut])
def list_products(
    incluir_inactivos: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Lista los productos ordenados por nombre.

    Por defecto solo devuelve los activos. Con incluir_inactivos=true un administrador
    ve también los dados de baja; para el resto de los usuarios el parámetro se ignora.
    """
    query = db.query(Product)
    if not (incluir_inactivos and es_admin(user)):
        query = query.filter(Product.activo.is_(True))
    return query.order_by(Product.nombre).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Devuelve un producto. Los inactivos solo los puede ver un administrador."""
    product = buscar_producto(product_id, db)
    if not product.activo and not es_admin(user):
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Da de alta un producto. Responde 409 si ya existe otro con el mismo código."""
    product = Product(**product_data.model_dump(), activo=True)
    db.add(product)
    return guardar(product, db)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Modifica los campos enviados de un producto. También sirve para reactivarlo.

    La descripción y la imagen se pueden borrar enviando null; el resto de los campos
    no admite null.
    """
    product = buscar_producto(product_id, db)
    cambios = product_data.model_dump(exclude_unset=True)

    for campo, valor in cambios.items():
        if valor is None and campo not in ("descripcion", "imagen_url"):
            raise HTTPException(status_code=422, detail=f"El campo {campo} no puede ser nulo")
        setattr(product, campo, valor)

    return guardar(product, db)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Da de baja un producto (borrado lógico): queda inactivo pero sigue en la base."""
    product = buscar_producto(product_id, db)
    product.activo = False
    db.commit()

