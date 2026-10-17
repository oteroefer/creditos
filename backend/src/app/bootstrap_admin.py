"""Comando para darle el rol admin a una cuenta que ya existe.

Uso: python -m app.bootstrap_admin <usuario>
"""

import argparse

from app.database import Base, SessionLocal, engine, ensure_role_schema
from app.models import Role, User


def main() -> None:
    """Busca el usuario indicado y le asigna el rol admin, creándolo si no existe."""
    parser = argparse.ArgumentParser(
        description="Asigna el rol admin a una cuenta existente."
    )
    parser.add_argument("username", help="Nombre de usuario existente")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    ensure_role_schema()

    with SessionLocal() as db:
        user = db.query(User).filter(User.username == args.username).first()
        if user is None:
            parser.error(
                f"No existe la cuenta {args.username!r}. Regístrala primero y vuelve a ejecutar."
            )

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if admin_role is None:
            admin_role = Role(name="admin")
            db.add(admin_role)
            db.flush()

        user.role = admin_role
        db.commit()

    print(f"Rol admin asignado a {args.username}.")


if __name__ == "__main__":
    main()
