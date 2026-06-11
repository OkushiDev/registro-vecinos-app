# Registro Vecinos App

Sistema de gestión para juntas de vecinos. Permite registrar vecinos, gestionar solicitudes de certificados de residencia, subir documentos y mantener un historial de auditoría.

> 📚 Documentación completa en [`docs/`](./docs/):
> - [Arquitectura](./docs/01-architecture.md) — Visión general del sistema
> - [API Reference](./docs/02-api-reference.md) — Todos los endpoints
> - [Base de Datos](./docs/03-database-schema.md) — Schema y seed data
> - [Frontend](./docs/04-frontend.md) — Componentes, routing, utilidades
> - [Lecciones Aprendidas](./docs/05-lessons-learned.md) — Para una futura V2

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite 7 + MUI 7 |
| **Backend** | Python 3.11+ / FastAPI + SQLAlchemy 2.0 |
| **Base de datos** | PostgreSQL |
| **Autenticación** | JWT (python-jose + bcrypt) |
| **PDF** | ReportLab + PyPDF2 |
| **Gestores** | uv (Python) / npm (Node) |

## Estado

| Indicador | Valor |
|-----------|-------|
| Tests backend | 28 ✅ |
| Tests frontend | 21 ✅ |
| Bundle inicial | 661 kB (-62%) |
| Endpoints públicos | 2 (token, tipos) |
| Error Boundary | ✅ |
| 404 page | ✅ |
| Issues pendientes | [4](./TODO.md) |

## Requisitos previos

- Python 3.11+
- Node.js 20+
- Docker (para PostgreSQL)
- [uv](https://docs.astral.sh/uv/) — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- npm (incluido con Node)

## Setup rápido

### 1. Base de datos

```bash
cd database
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432`, usuario `postgres`, contraseña `1234`.

### 2. Backend

```bash
cd backend
cp .env.example .env          # Opcional: configurar variables
uv sync --dev                 # Instalar dependencias
uv run uvicorn app.api.main:app --reload --port 8000
```

Documentación de la API disponible en `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # Opcional: configurar VITE_API_URL
npm install
npm run dev
```

Abrir `http://localhost:5173`.

### 4. Verificación

```bash
# Tests del backend
cd backend && uv run pytest

# Build del frontend
cd frontend && npm run build
```

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/postgres` | Conexión a BD |
| `JWT_SECRET_KEY` | `DEV_ONLY_CHANGE_IN_PRODUCTION` | Clave para firmar JWT |

### Frontend (`frontend/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL base del backend |

## Comandos útiles

```bash
# Backend
cd backend
uv sync --dev                  # Sincronizar dependencias
uv run pytest                  # Ejecutar tests (28 tests)
uv run uvicorn app.api.main:app --reload

# Frontend
cd frontend
npm install                    # Instalar dependencias
npm run dev                    # Servidor desarrollo (localhost:5173)
npm run build                  # Build producción
npm run lint                   # ESLint

# Base de datos
cd database
docker compose up -d           # Iniciar PostgreSQL
docker compose down            # Detener PostgreSQL
```

## Estructura del proyecto

```
registro-vecinos-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py              # Bootstrap FastAPI
│   │   │   ├── schemas.py           # Pydantic models
│   │   │   ├── dependencies.py      # get_current_user, oauth2
│   │   │   ├── utils.py             # Helpers compartidos
│   │   │   ├── models.py            # SQLAlchemy models
│   │   │   ├── database.py          # Engine y sesión
│   │   │   ├── routers/             # Endpoints por dominio
│   │   │   │   ├── auth.py
│   │   │   │   ├── vecinos.py
│   │   │   │   ├── documentos.py
│   │   │   │   ├── solicitudes.py
│   │   │   │   └── historial.py
│   │   │   └── certificados.py      # Generación PDF
│   │   ├── core/
│   │   │   └── security.py          # JWT, bcrypt
│   │   └── Test/                    # Tests (28)
│   ├── pyproject.toml               # Dependencias (uv)
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api.tsx                   # Axios instance
│   │   ├── services/authService.ts   # Auth
│   │   ├── components/               # UI components
│   │   ├── components/pages/         # Pages
│   │   └── utils/                    # rut.ts, pdf.ts, excel.ts
│   ├── .env
│   └── vite.config.ts
├── database/
│   └── docker-compose.yaml
└── .gitignore
```

## Inicializacion del proyecto

> Esta seccion documenta como se creo el proyecto desde cero, util como referencia historica.

### Backend

```bash
mkdir backend
cd backend
uv init
uv add 'fastapi[standard]'
```

### Frontend

```bash
npm create vite@latest frontend
```
