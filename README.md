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

## Documentación

### Documentación de la API (endpoints)

FastAPI genera automáticamente. Con el backend corriendo
(`uvicorn app.main:app --reload` desde `backend/src`):

- **http://localhost:8000/docs**: Swagger. Lista todos los endpoints y permite
  probarlos desde el navegador. Para los que requieren admin, toca **Authorize**
  y pega el `access_token` que devuelve `/auth/login`.
- **http://localhost:8000/redoc**: la misma información en formato de lectura.
- **http://localhost:8000/openapi.json**: la especificación en JSON

### Documentación del código (Pydoc)

Pydoc arma la documentación a partir de los docstrings de cada módulo. Necesita
importar el código, así que hay que tener el entorno virtual activado con las
dependencias instaladas.
Para ver en el navegador sin generar archivos:

```powershell
cd backend\src
python -m pydoc -b
```
Para generar un archivo `.html` por módulo:

```powershell
cd backend\src
python -m pydoc -w app app.core app.core.database app.core.security app.core.dependencies app.auth app.auth.router app.auth.schemas app.usuarios app.usuarios.models app.usuarios.schemas app.usuarios.router app.roles app.roles.models app.roles.schemas app.roles.router app.productos app.productos.models app.productos.schemas app.productos.router app.productos.seed app.bootstrap_admin app.main
```
`app.main` se conecta a PostgreSQL al importarse: si la base no está levantada,
quíta del comando.

## Estructura del backend

El código de `backend/src/app` está separado por flujo. Cada módulo tiene su tabla
(`models.py`), los formatos de entrada y salida (`schemas.py`) y sus rutas (`router.py`):

```
app/
├── main.py              crea las tablas y registra las rutas de cada módulo
├── bootstrap_admin.py   comando para dar el rol admin a una cuenta
├── core/                lo compartido: base de datos, seguridad (bcrypt, JWT) y permisos
├── auth/                inicio de sesión
├── usuarios/            registro, listado y asignación de roles
├── roles/               alta, modificación y baja de roles
└── productos/           catálogo de productos (seed.py carga productos de ejemplo)
```

Para un módulo nuevo (por ejemplo la simulación de créditos), crear su carpeta con
esos tres archivos y registrar el router en `main.py`.

## Productos de ejemplo

Con el entorno virtual activado, desde `backend/src`:

```powershell
python -m app.productos.seed
```

Carga 10 productos con imagen de ejemplo. Los que ya existen (mismo código) se saltean.
