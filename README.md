# Registro Vecinos App

Sistema de gestión para juntas de vecinos. Permite registrar vecinos, gestionar solicitudes de certificados de residencia, subir documentos y mantener un historial de auditoría.

> 📚 Documentación completa en [`docs/`](./docs/): [Arquitectura](./docs/01-architecture.md) · [API](./docs/02-api-reference.md) · [Base de Datos](./docs/03-database-schema.md) · [Frontend](./docs/04-frontend.md) · [Lecciones](./docs/05-lessons-learned.md)

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript 5.9 + Vite 7 + MUI 7 |
| Backend | Python 3.11+ / FastAPI + SQLAlchemy 2.0 |
| Base de datos | PostgreSQL (Docker) |
| Auth | JWT (OAuth2PasswordBearer + bcrypt) |
| PDF | ReportLab + pypdf |
| Excel | ExcelJS (lazy-loaded) |
| Gestores | uv (Python) / npm (Node) |
| Tests | pytest (45) + vitest (27) |

---

## Inicio rápido

### Requisitos

- **Python 3.11+** — [pyenv](https://github.com/pyenv/pyenv) recomendado
- **Node.js 20+** — [nvm](https://github.com/nvm-sh/nvm) recomendado
- **Docker** — para PostgreSQL
- **[uv](https://docs.astral.sh/uv/)** — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **npm** — incluido con Node

### 1. Clonar e instalar

```bash
git clone git@github.com:OkushiDev/registro-vecinos-app.git
cd registro-vecinos-app
```

### 2. Base de datos

```bash
cd database
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` con:
- Usuario: `postgres`
- Contraseña: `1234`
- Base de datos: `postgres`
- Ejecuta `scripts/init.sql` automáticamente (crea tablas + 35 vecinos de seed)

Si vienes de una base creada antes del fix de zona horaria, ejecuta la
migración antes de arrancar el backend nuevo y una sola vez, con el instante
UTC del despliegue:

```bash
docker compose -f database/docker-compose.yaml exec -T database-app \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 -v cutoff="<UTC-del-deploy>" \
  -f /docker-entrypoint-initdb.d/migrations/2026-11-13_timestamps_utc.sql
```

En desarrollo puedes recrear el volumen con `docker compose down -v`.

### 3. Backend

```bash
cd backend
cp .env.example .env            # Crear .env desde template
uv sync --dev                   # Instalar dependencias + dev tools
uv run uvicorn app.api.main:app --reload --port 8000 --env-file .env
```

La API corre en `http://localhost:8000`. Documentación interactiva en [`/docs`](http://localhost:8000/docs).

**Seed data — credenciales de prueba:**
- **Presidente**: RUT `14306046-2` / contraseña `Benavides1430`
- **Vecinos**: RUT = username, contraseña = `ApellidoPaterno + primeros 4 dígitos del RUT` (ej: `Bolados1353` para `13532259-8`)

### 4. Frontend

```bash
cd frontend
cp .env.example .env            # Crear .env desde template
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

### 5. Verificar que todo funciona

```bash
# Tests backend (45)
cd backend
uv run pytest app/Test/

# Tests frontend (27)
cd frontend
npm test

# Build producción frontend
npm run build
```

---

## Uso

### Roles

| Rol | Funcionalidades |
|-----|----------------|
| **Presidente** | CRUD de vecinos, ver documentos, aprobar/rechazar solicitudes, generar certificados, auditoría, subir archivos, exportar Excel |
| **Vecino** | Ver sus antecedentes, cambiar contraseña, solicitar certificado, subir documentos |

### Flujo típico

1. Presidente inicia sesión con RUT `14306046-2` / `Benavides1430`
2. Registra vecinos desde `/presidente/vecinos` → botón "Agregar Vecino"
3. El vecino recibe su RUT como usuario y `Apellido + 4 dígitos` como contraseña
4. Vecino inicia sesión, ve sus datos en `/vecino/antecedentes-vecino`
5. Vecino solicita certificado → presidente lo aprueba/rechaza desde notificaciones
6. Presidente genera PDF del certificado y se lo entrega al vecino

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | obligatoria (ver `.env.example`) | Conexión PostgreSQL |
| `JWT_SECRET_KEY` | obligatoria (ver `.env.example`) | ⚠️ Cambiar en producción |

### Frontend (`frontend/.env`)

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL del backend |

---

## Comandos

```bash
# ── Backend ──
cd backend
uv sync --dev                   # Instalar dependencias
uv run pytest app/Test/         # Tests (45)
uv run ruff check .             # Linter
uv run uvicorn app.api.main:app --reload --port 8000 --env-file .env

# ── Frontend ──
cd frontend
npm install                     # Instalar dependencias
npm run dev                     # Dev server (localhost:5173)
npm run build                   # Build producción
npm test                        # Tests (27, vitest)
npm run test:watch              # Tests en watch mode
npm run lint                    # ESLint

# ── Base de datos ──
cd database
docker compose up -d            # Iniciar
docker compose down             # Detener (datos persisten en volumen)
docker compose down -v          # Destruir volumen (reinicia seed data)
```

---

## Estructura

```
registro-vecinos-app/
├── docs/                              # Documentación
│   ├── 01-architecture.md
│   ├── 02-api-reference.md
│   ├── 03-database-schema.md
│   ├── 04-frontend.md
│   └── 05-lessons-learned.md
├── TODO.md                            # Issues pendientes
│
├── backend/                           # API (Python + FastAPI)
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py                # App factory (48 líneas)
│   │   │   ├── database.py            # SQLAlchemy engine + session
│   │   │   ├── models.py              # ORM: Vecino, Usuario, Documento, etc.
│   │   │   ├── schemas.py             # Pydantic + validación RUT mod-11
│   │   │   ├── dependencies.py        # get_current_user (OAuth2)
│   │   │   ├── utils.py               # Helpers: archivos, passwords, fechas
│   │   │   ├── certificados.py        # PDF con plantilla ReportLab
│   │   │   └── routers/
│   │   │       ├── auth.py            # Login + perfil
│   │   │       ├── vecinos.py         # CRUD + estado + num socio
│   │   │       ├── documentos.py      # Subida/descarga/eliminación
│   │   │       ├── solicitudes.py     # Crear/ocultar/rechazar/realizar
│   │   │       └── historial.py       # Auditoría
│   │   ├── core/
│   │   │   └── security.py            # JWT + bcrypt
│   │   └── Test/                      # 45 tests (pytest)
│   ├── resources/
│   │   └── certificado_plantilla.pdf
│   ├── pyproject.toml
│   └── .env.example
│
├── frontend/                          # SPA (React + TypeScript)
│   └── src/
│       ├── App.tsx                    # Root: rutas, tema, ErrorBoundary
│       ├── api.tsx                    # Fetch wrapper + JWT
│       ├── main.tsx                   # Entry point
│       ├── context/
│       │   ├── auth.ts                # Context + useAuth
│       │   └── AuthProvider.tsx       # Sesión, carga inicial y tema
│       ├── services/authService.ts    # Login/logout/token management
│       ├── components/
│       │   ├── ErrorBoundary.tsx      # Crash recovery
│       │   ├── Login.tsx              # Login form
│       │   ├── Navbar.tsx             # Navigation + theme toggle
│       │   ├── NotificationMenu.tsx   # Campana de notificaciones
│       │   ├── RegistroVecinoForm.tsx   # Crear/editar (mode prop)
│       │   └── pages/
│       │       ├── ListaVecinos.tsx        # 365L (orquestador)
│       │       ├── lista-vecinos/          # filtros, tabla, diálogos
│       │       ├── Antecedentes_vecino.tsx # 451L (orquestador)
│       │       ├── antecedentes/           # datos, documentos, diálogos
│       │       ├── ListaSolicitudes.tsx    # 283L (orquestador)
│       │       ├── solicitudes/            # stats, filtros, tabla
│       │       ├── Documentos.tsx          # 139L (orquestador)
│       │       ├── documentos/             # búsqueda, tabla
│       │       ├── Historial.tsx           # 453L
│       │       ├── SubirDocumento.tsx      # 250L
│       │       └── NotFound.tsx            # 404 page
│       ├── constants/
│       │   └── calles.ts              # CALLES, RELACIONES_PROPIEDAD
│       ├── utils/
│       │   ├── rut.ts                 # Formateo/validación RUT
│       │   ├── pdf.ts                 # Descarga de PDF
│       │   ├── excel.ts               # Export Excel (ExcelJS lazy)
│       │   ├── error.ts               # getErrorMessage()
│       │   ├── download.ts            # descargarBlob()
│       │   └── pagination.ts          # usePagination(), displayedRowsLabel
│       └── test/                      # 27 tests (vitest)
│           ├── api.test.ts
│           ├── authContext.test.tsx
│           ├── rut.test.ts
│           ├── pdf.test.ts
│           ├── excel.test.ts
│           └── setup.ts
│
└── database/
    ├── docker-compose.yaml            # PostgreSQL
    └── scripts/
        └── init.sql                   # Schema + 35 vecinos seed
```

---
## Notas

- **El bundle inicial es de ~654 kB** (React.lazy + Suspense en 6 páginas + ExcelJS dinámico)
- **Solo 2 endpoints son públicos** (`/api/token` para login, `/api/documentos/tipos` para lista estática)
- **Todas las mutaciones quedan registradas** en el historial de auditoría
- **Las contraseñas seed usan pgcrypto** (`crypt()`). Python usa `bcrypt`. El backend tiene lógica de compatibilidad `$2a$` → `$2b$` en `core/security.py`
