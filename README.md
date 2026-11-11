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

## Cómo levantar el proyecto

Requisitos: Python 3.12, Node.js y PostgreSQL con una base `ventas_db`
(la conexión está en `backend/src/app/core/database.py`).

**Backend** (en una terminal):

```powershell
cd backend\src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Al arrancar crea las tablas que falten. Queda en http://localhost:8000.

**Frontend** (en otra terminal):

```powershell
cd frontend-creditos\frontend
npm install
npm run dev
```

Queda en http://localhost:5173. Las llamadas a `/api` se reenvían al backend.
Después de cada `git pull` conviene volver a correr `npm install` y
`pip install -r requirements.txt` por si cambiaron las dependencias.

**Pruebas** (con el entorno virtual activado, desde `backend\src`):

```powershell
python -m pytest
```

Usan una base SQLite en memoria, así que no necesitan PostgreSQL.

## Administración de roles

Toda cuenta nueva se registra con el rol `cliente`: el registro no permite elegir
rol. Los roles `vendedor` y `admin` solo los asigna un administrador desde la
página de Usuarios. Solo una cuenta con el rol `admin` puede ver usuarios, crear
roles y asignarlos.

| Rol      | Qué puede hacer                                                        |
| -------- | ---------------------------------------------------------------------- |
| cliente  | Ver el catálogo (sin stock) y el detalle de cada producto              |
| vendedor | Ver el catálogo con stock                                              |
| admin    | Todo lo anterior, gestionar productos, usuarios y roles                |

Para promover la primera cuenta a admin, inicia el backend al menos una vez para
que cree/actualice el esquema, registra la cuenta y ejecuta desde PowerShell:

```powershell
cd backend\src
.\.venv\Scripts\Activate.ps1
python -m app.bootstrap_admin <usuario>
```

El comando solo asigna `admin` a una cuenta existente; no crea usuarios ni
cambia contraseñas. Luego vuelve a iniciar sesión. El panel para crear y
asignar roles aparecerá en el dashboard de esa cuenta.

## Documentación

### Documentación de la API (endpoints)

FastAPI la genera automáticamente. Con el backend corriendo
(`uvicorn app.main:app --reload` desde `backend/src`):

- **http://localhost:8000/docs**: Swagger. Lista todos los endpoints y permite
  probarlos desde el navegador. Para los que requieren admin, toca **Authorize**
  y pega el `access_token` que devuelve `/auth/login`.
- **http://localhost:8000/redoc**: la misma información en formato de lectura.
- **http://localhost:8000/openapi.json**: la especificación en JSON

### Endpoints de productos (`/productos`)

Todos requieren iniciar sesión: enviar el encabezado
`Authorization: Bearer <access_token>` (el token lo devuelve `/auth/login`).

| Método   | Ruta              | Quién            | Qué hace                                                              |
| -------- | ----------------- | ---------------- | --------------------------------------------------------------------- |
| `GET`    | `/productos/`     | Cualquier usuario | Lista los productos activos ordenados por nombre                     |
| `GET`    | `/productos/?incluir_inactivos=true` | Admin | Lista también los dados de baja (para el resto se ignora)    |
| `GET`    | `/productos/{id}` | Cualquier usuario | Devuelve un producto (los inactivos solo los ve un admin)            |
| `POST`   | `/productos/`     | Admin            | Da de alta un producto                                                |
| `PATCH`  | `/productos/{id}` | Admin            | Modifica los campos enviados; con `{"activo": true}` lo reactiva      |
| `DELETE` | `/productos/{id}` | Admin            | Baja lógica: el producto queda con `activo: false`, no se borra        |

**Cuerpo para crear** (`POST /productos/`):

```json
{
  "codigo": "tv-50",
  "nombre": "Televisor Smart 50 pulgadas",
  "descripcion": "Smart TV 4K UHD con Wi-Fi y control por voz",
  "precio": 3500000,
  "stock": 8,
  "imagen_url": "https://placehold.co/400x300/7c3aed/ffffff/png?text=Televisor"
}
```

- `codigo`: obligatorio, único. Se guarda en mayúsculas y sin espacios (`tv-50` → `TV-50`).
- `nombre`: obligatorio, entre 2 y 100 caracteres.
- `precio`: obligatorio, mayor a 0, hasta 2 decimales.
- `stock`: opcional (por defecto 0), no puede ser negativo.
- `descripcion` e `imagen_url`: opcionales. En un `PATCH` se pueden borrar enviando `null`.

**Respuesta** (`201 Created` al crear; `200 OK` en `GET` y `PATCH`). El listado devuelve
una lista de estos objetos:

```json
{
  "id": 1,
  "codigo": "TV-50",
  "nombre": "Televisor Smart 50 pulgadas",
  "descripcion": "Smart TV 4K UHD con Wi-Fi y control por voz",
  "precio": 3500000.0,
  "stock": 8,
  "imagen_url": "https://placehold.co/400x300/7c3aed/ffffff/png?text=Televisor",
  "activo": true
}
```

`DELETE` responde `204 No Content`, sin cuerpo.

**Errores**: el cuerpo es `{"detail": "<mensaje>"}`.

| Código | Cuándo                                    | `detail`                                   |
| ------ | ----------------------------------------- | ------------------------------------------ |
| 401    | Sin token, o token inválido o vencido     | `Autenticación requerida`                  |
| 403    | El usuario no es admin (alta, cambios, baja) | `Se requiere el rol de administrador`   |
| 404    | El producto no existe                     | `Producto no encontrado`                   |
| 409    | El código ya lo usa otro producto         | `Ya existe un producto con ese código`     |
| 422    | Datos inválidos (precio ≤ 0, stock negativo, campo nulo...) | Lista con el detalle de cada campo |

### Documentación del código (Pydoc)

Pydoc arma la documentación a partir de los docstrings de cada módulo. Necesita
importar el código, así que hay que tener el entorno virtual activado con las
dependencias instaladas.
Para ver en el navegador sin generar archivos:

```powershell
cd backend\src
python -m pydoc -b
```
Para generar un archivo `.html` por módulo (quedan en `backend/docs/`):

```bash
cd backend/docs
PYTHONPATH=../src ../src/.venv/bin/python -m pydoc -w app app.core app.core.database app.core.security app.core.dependencies app.auth app.auth.router app.auth.schemas app.usuarios app.usuarios.models app.usuarios.schemas app.usuarios.router app.roles app.roles.models app.roles.schemas app.roles.router app.productos app.productos.models app.productos.schemas app.productos.router app.productos.seed app.simulacion app.simulacion.servicio app.simulacion.schemas app.simulacion.router app.ventas app.ventas.models app.ventas.schemas app.ventas.router app.bootstrap_admin
```
`app.main` no se incluye porque se conecta a PostgreSQL al importarse. En Windows
(PowerShell) el equivalente es `cd backend\docs`, definir `$env:PYTHONPATH="..\src"` y usar
`python -m pydoc -w ...` con el entorno virtual activado.

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
