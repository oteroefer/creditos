"""Comando para cargar productos de ejemplo en el catálogo.

Uso: python -m app.productos.seed

Los productos cuyo código ya existe se saltean, así que se puede ejecutar más de una vez.
Las imágenes son de placehold.co (un recuadro con el nombre del producto); se pueden
reemplazar por fotos reales editando la URL desde la pantalla de Productos.
"""

from decimal import Decimal
from urllib.parse import quote

from app.core.database import Base, SessionLocal, engine, ensure_product_schema
from app.productos.models import Product


def imagen(texto: str) -> str:
    """Devuelve la URL de una imagen de 400x300 con el texto indicado."""
    return f"https://placehold.co/400x300/7c3aed/ffffff/png?text={quote(texto)}"


PRODUCTOS = [
    {
        "codigo": "TV-50",
        "nombre": "Televisor Smart 50 pulgadas",
        "descripcion": "Smart TV 4K UHD con Wi-Fi y control por voz",
        "precio": Decimal("3500000"),
        "stock": 8,
    },
    {
        "codigo": "TV-32",
        "nombre": "Televisor Smart 32 pulgadas",
        "descripcion": "Smart TV HD con Netflix y YouTube",
        "precio": Decimal("1600000"),
        "stock": 15,
    },
    {
        "codigo": "HEL-01",
        "nombre": "Heladera No Frost 300 L",
        "descripcion": "Heladera con freezer superior, eficiencia energética A",
        "precio": Decimal("4200000"),
        "stock": 5,
    },
    {
        "codigo": "LAV-01",
        "nombre": "Lavarropas automático 8 kg",
        "descripcion": "Carga frontal, 15 programas de lavado",
        "precio": Decimal("3100000"),
        "stock": 6,
    },
    {
        "codigo": "AA-12",
        "nombre": "Aire acondicionado 12000 BTU",
        "descripcion": "Split inverter frío/calor",
        "precio": Decimal("3800000"),
        "stock": 10,
    },
    {
        "codigo": "MIC-01",
        "nombre": "Microondas 20 L",
        "descripcion": "Microondas digital con grill",
        "precio": Decimal("750000"),
        "stock": 20,
    },
    {
        "codigo": "NB-01",
        "nombre": "Notebook 15 pulgadas",
        "descripcion": "Intel Core i5, 8 GB RAM, SSD 512 GB",
        "precio": Decimal("5200000"),
        "stock": 4,
    },
    {
        "codigo": "CEL-01",
        "nombre": "Celular 128 GB",
        "descripcion": "Pantalla 6.5 pulgadas, cámara triple",
        "precio": Decimal("2300000"),
        "stock": 25,
    },
    {
        "codigo": "COC-01",
        "nombre": "Cocina a gas 4 hornallas",
        "descripcion": "Horno con encendido eléctrico",
        "precio": Decimal("1900000"),
        "stock": 7,
    },
    {
        "codigo": "VEN-01",
        "nombre": "Ventilador de pie",
        "descripcion": "3 velocidades, oscilante",
        "precio": Decimal("280000"),
        "stock": 30,
    },
]


def main() -> None:
    """Inserta los productos de ejemplo que todavía no estén cargados."""
    Base.metadata.create_all(bind=engine)
    ensure_product_schema()

    with SessionLocal() as db:
        existentes = {codigo for (codigo,) in db.query(Product.codigo).all()}
        nuevos = [
            Product(**datos, imagen_url=imagen(datos["nombre"]), activo=True)
            for datos in PRODUCTOS
            if datos["codigo"] not in existentes
        ]
        db.add_all(nuevos)
        db.commit()

    print(f"Productos agregados: {len(nuevos)}. Ya existían: {len(PRODUCTOS) - len(nuevos)}.")


if __name__ == "__main__":
    main()
