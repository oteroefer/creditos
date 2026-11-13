"""Rutas de ventas.

Solo vendedores y administradores registran ventas desde el panel de ventas. Un cliente
puede comprar a crédito por su cuenta con /ventas/solicitar. Vendedores y administradores
ven todas las ventas; un cliente ve únicamente las suyas.
"""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.productos.models import Product
from app.simulacion.servicio import calcular_plan
from app.usuarios.models import User
from app.ventas.models import Venta
from app.ventas.schemas import SolicitudCompra, VentaCreate, VentaOut

router = APIRouter(prefix="/ventas", tags=["ventas"])

ROLES_VENDEDORES = ("vendedor", "admin")

# Tasa anual (%) de las compras a crédito que hace el cliente desde la web. Si se cambia
# acá, hay que cambiar también TASA_ANUAL en el frontend (PaginaDetalleProducto.jsx).
TASA_ANUAL_ONLINE = Decimal("24")


def es_personal_de_ventas(user: User) -> bool:
    """Indica si el usuario es vendedor o administrador."""
    return user.role is not None and user.role.name in ROLES_VENDEDORES


def require_vendedor(user: User = Depends(get_current_user)) -> User:
    """Devuelve el usuario si es vendedor o admin; si no, responde 403."""
    if not es_personal_de_ventas(user):
        raise HTTPException(status_code=403, detail="Se requiere el rol de vendedor o administrador")
    return user


@router.post("/", response_model=VentaOut, status_code=201)
def crear_venta(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    vendedor: User = Depends(require_vendedor),
):
    """Registra la venta de un producto a un cliente y descuenta el stock.

    Guarda el precio y el total del momento. Si se envían cuotas y tasa_anual calcula
    la cuota mensual con el módulo de simulación.
    Errores: 404 si el cliente no existe o el producto no existe o está inactivo,
    409 si no hay stock suficiente.
    """
    cliente = db.query(User).filter(User.id == datos.cliente_id).first()
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    producto = db.query(Product).filter(Product.id == datos.producto_id).first()
    if producto is None or not producto.activo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.stock < datos.cantidad:
        raise HTTPException(status_code=409, detail="Stock insuficiente")

    total = producto.precio * datos.cantidad
    cuota_mensual = None
    if datos.cuotas is not None:
        cuota_mensual = calcular_plan(total, datos.tasa_anual, datos.cuotas)["cuota_mensual"]

    producto.stock -= datos.cantidad
    venta = Venta(
        cliente_id=cliente.id,
        vendedor_id=vendedor.id,
        producto_id=producto.id,
        cantidad=datos.cantidad,
        precio_unitario=producto.precio,
        total=total,
        cuotas=datos.cuotas,
        tasa_anual=datos.tasa_anual,
        cuota_mensual=cuota_mensual,
    )
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta


@router.post("/solicitar", response_model=VentaOut, status_code=201)
def solicitar_compra(
    datos: SolicitudCompra,
    db: Session = Depends(get_db),
    cliente: User = Depends(get_current_user),
):
    """Un cliente compra a crédito una unidad de un producto por su cuenta.

    La tasa la fija el servidor (TASA_ANUAL_ONLINE). Como la tabla de ventas exige un
    vendedor, una compra hecha por el propio cliente se guarda con él mismo en
    vendedor_id: significa "compra online, sin vendedor". Descuenta el stock.
    Errores: 403 si quien llama es vendedor o admin (ellos usan POST /ventas/),
    404 si el producto no existe o está inactivo, 409 si no hay stock.
    """
    if es_personal_de_ventas(cliente):
        raise HTTPException(
            status_code=403,
            detail="Los vendedores y administradores registran ventas desde el panel de ventas",
        )

    producto = db.query(Product).filter(Product.id == datos.producto_id).first()
    if producto is None or not producto.activo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.stock < 1:
        raise HTTPException(status_code=409, detail="Producto sin stock")

    total = producto.precio
    cuota_mensual = calcular_plan(total, TASA_ANUAL_ONLINE, datos.cuotas)["cuota_mensual"]

    producto.stock -= 1
    venta = Venta(
        cliente_id=cliente.id,
        vendedor_id=cliente.id,
        producto_id=producto.id,
        cantidad=1,
        precio_unitario=producto.precio,
        total=total,
        cuotas=datos.cuotas,
        tasa_anual=TASA_ANUAL_ONLINE,
        cuota_mensual=cuota_mensual,
    )
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta


@router.get("/", response_model=list[VentaOut])
def listar_ventas(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Lista las ventas, de la más reciente a la más antigua.

    Vendedores y administradores ven todas; un cliente solo las suyas.
    """
    query = db.query(Venta)
    if not es_personal_de_ventas(user):
        query = query.filter(Venta.cliente_id == user.id)
    return query.order_by(Venta.id.desc()).all()