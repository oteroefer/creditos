# Taller de Ingeniería de Software

## Integrantes

- Cecilia Alvarez
- Tobias Castro
- Fernanda Otero
- Ángel Rodriguez

## Declaración de propósito del proyecto

El propósito del proyecto es desarrollar un software de ventas que permita gestionar
productos, clientes y ventas de manera sencilla y eficiente, facilitando el control y
la administración de las operaciones comerciales.

## Stack tecnológico

### Lenguaje de programación (frameworks y librerías)

| Capa     | Lenguajes            | Frameworks / Librerías        |
| -------- | -------------------- | ----------------------------- |
| Frontend | Python, JavaScript   | FastAPI, React, SQLAlchemy    |
| Backend  | Python               | FastAPI                       |

### Motor de base de datos

- PostgreSQL

### IDE

- Visual Studio Code

### Sistema de control de versiones

- Git — Repositorio: https://github.com/oteroefer/softwareTaller.git

### Marco de pruebas

- Pytest

### Documentación de código

- Pydoc

## Administración de roles

Los usuarios pueden registrarse normalmente, pero solo una cuenta con el rol
`admin` puede ver usuarios, crear roles y asignarlos. Para promover la primera
cuenta, inicia el backend al menos una vez para que cree/actualice el esquema,
registra la cuenta y ejecuta desde PowerShell:

```powershell
Set-Location "C:\Users\Tobias Castro\Desktop\softwareTaller\backend\src"
& "C:\Users\Tobias Castro\Desktop\softwareTaller\.venv\Scripts\python.exe" -m app.bootstrap_admin Toias43
```

El comando solo asigna `admin` a una cuenta existente; no crea usuarios ni
cambia contraseñas. Luego vuelve a iniciar sesión. El panel para crear y
asignar roles aparecerá en el dashboard de esa cuenta.
