# Arquitectura del Sistema

## Visión General

Sistema web para gestión de juntas de vecinos. Dos roles: **presidente** (admin) y **vecino** (residente). El presidente gestiona vecinos, documentos, solicitudes de certificados y auditoría. Los vecinos consultan sus datos, suben documentos y solicitan certificados.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Login   │  │  Navbar  │  │  Pages   │  │   utils/      │  │
│  │          │  │          │  │(6 pages) │  │ rut/pdf/excel │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └───────────────┘  │
│       │                           │                            │
│       └──────────┬────────────────┘                            │
│                  │ axios (api.tsx con JWT interceptor)          │
└──────────────────┼─────────────────────────────────────────────┘
                   │ HTTP (localhost:8000)
┌──────────────────┼─────────────────────────────────────────────┐
│                  ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FASTAPI (backend/app/api/)                  │  │
│  │                                                          │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │ routers/│ │  core/   │ │ models/ │ │ certificados│  │  │
│  │  │ auth    │ │security  │ │ schemas │ │ (PDF gen)   │  │  │
│  │  │ vecinos │ │(JWT,     │ │ database│ └─────────────┘  │  │
│  │  │ docs    │ │ bcrypt)  │ │ utils   │                  │  │
│  │  │ solic.  │ └──────────┘ └─────────┘                  │  │
│  │  │ hist.   │                                            │  │
│  │  └─────────┘                                            │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │ SQLAlchemy                            │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │              POSTGRESQL (Docker)                         │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │  │
│  │  │ vecinos │ │ usuarios │ │ documen- │ │ solicitudes │  │  │
│  │  │         │ │          │ │ tos      │ │             │  │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │  │
│  │  ┌─────────┐                                            │  │
│  │  │ histo-  │                                            │  │
│  │  │ rial    │                                            │  │
│  │  └─────────┘                                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + TypeScript + Vite | 19 / 5.9 / 7 |
| UI | MUI (Material-UI) + Emotion | 7 |
| HTTP Client | Axios | 1.x |
| Routing | react-router-dom | 7 |
| Backend | Python + FastAPI | 3.11+ / 0.120+ |
| ORM | SQLAlchemy | 2.0 |
| Auth | python-jose (JWT) + bcrypt | — |
| PDF | ReportLab + PyPDF2 | — |
| Database | PostgreSQL | latest (Docker) |
| Excel | ExcelJS (frontend) | 4.x |

## Gestores de Paquetes

| Proyecto | Gestor | Comando clave |
|----------|--------|--------------|
| Backend | uv | `uv sync --dev`, `uv run pytest` |
| Frontend | npm | `npm install`, `npm run dev` |

## Estructura de Archivos

```
registro-vecinos-app/
├── docs/                           # Documentación
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py             # Bootstrap FastAPI, CORS, routers
│   │   │   ├── database.py         # Engine + Session
│   │   │   ├── models.py           # SQLAlchemy ORM (5 tablas)
│   │   │   ├── schemas.py          # Pydantic (request/response)
│   │   │   ├── dependencies.py     # get_current_user, oauth2
│   │   │   ├── utils.py            # Helpers: archivos, password, historial
│   │   │   ├── certificados.py     # Generación PDF con plantilla
│   │   │   ├── tool_posiciones.py  # Dev tool: cuadrícula PDF
│   │   │   └── routers/
│   │   │       ├── auth.py         # Login, perfil actual
│   │   │       ├── vecinos.py      # CRUD + estados
│   │   │       ├── documentos.py   # Subida/descarga
│   │   │       ├── solicitudes.py  # Solicitudes certificados
│   │   │       └── historial.py    # Auditoría
│   │   ├── core/
│   │   │   └── security.py         # JWT create/decode, bcrypt hash/verify
│   │   └── resources/
│   │       └── certificado_plantilla.pdf
│   └── app/Test/                   # Tests pytest (28 tests)
├── frontend/
│   └── src/
│       ├── api.tsx                 # Axios instance + interceptors
│       ├── App.tsx                 # Root: theme, routing, auth gate
│       ├── services/authService.ts # Token management
│       ├── components/             # UI components (7)
│       ├── components/pages/       # Pages (6)
│       ├── utils/                  # rut.ts, pdf.ts, excel.ts
│       └── test/                   # Tests vitest (21 tests)
└── database/
    ├── docker-compose.yaml         # PostgreSQL container
    └── scripts/init.sql            # Schema + seed data (35 vecinos)
```

## Decisiones de Arquitectura

1. **Sin store global (Redux/Zustand)**: El estado se maneja con `useState`, `useEffect`, y eventos custom (`window.dispatchEvent`). Para una app de este tamaño es suficiente, pero en V2 convendría un store.

2. **JWT en localStorage**: Simple pero vulnerable a XSS. Alternativa para V2: httpOnly cookies.

3. **PDF con plantilla**: Se usa un PDF base (`certificado_plantilla.pdf`) y se superponen los datos con ReportLab + PyPDF2. Las coordenadas se ajustaron con `tool_posiciones.py`.

4. **autocommit=False en SQLAlchemy**: Manejo explícito de transacciones con `commit()`/`rollback()`.

5. **Seed data hardcodeada**: El `init.sql` contiene 35 vecinos de prueba con contraseñas generadas con pgcrypto (`crypt()`). El vecino #35 es el presidente.
