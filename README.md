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

## Instalación de dependencias

### Backend

```bash
cd C:\Users\Tobias Castro\Desktop\softwareTaller
.\.venv\Scripts\Activate.ps1
python -m pip install -r .\backend\src\requirements.txt
```

### Frontend

```bash
cd frontend-creditos/frontend
npm install
```

## Sprint 2: usuarios y roles

### Pruebas unitarias

```bash
cd C:\Users\Tobias Castro\Desktop\softwareTaller
.\.venv\Scripts\Activate.ps1
pytest -q
```

### Documentación automática

```bash
cd C:\Users\Tobias Castro\Desktop\softwareTaller\backend\src
..\..\.venv\Scripts\python.exe -m pydoc -w app
```

Esto genera archivos HTML de documentación en la carpeta del backend.

### Ejecución del backend

```bash
cd C:\Users\Tobias Castro\Desktop\softwareTaller\backend\src
..\..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Módulos incluidos en este sprint

- Gestión de usuarios
- Login con token JWT
- Gestión de roles
- Validación de usuario por email y username
- Pruebas de integración de endpoints con SQLite en pruebas
