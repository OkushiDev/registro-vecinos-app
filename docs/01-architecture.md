# Arquitectura del Sistema

## Visión General

Sistema web para gestión de juntas de vecinos. Dos roles: **presidente** (admin) y **vecino** (residente). El presidente gestiona vecinos, documentos, solicitudes de certificados y auditoría. Los vecinos consultan sus datos, suben documentos y solicitan certificados.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Login   │  │  Navbar  │  │  Pages   │  │   utils/        │  │
│  │          │  │          │  │(6 pages) │  │rut/pdf/excel/  │  │
│  │          │  │          │  │          │  │error/download/ │  │
│  │          │  │          │  │          │  │ pagination     │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └───────────────┘  │
│       │                           │                            │
│       └──────────┬────────────────┘                            │
│                  │ fetch (api.tsx con wrapper JWT)               │
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
| HTTP Client | Fetch nativo (wrapper) | — |
| Routing | react-router-dom | 7 |
| Backend | Python + FastAPI | 3.11+ / 0.136 |
| ORM | SQLAlchemy | 2.0 |
| Auth | python-jose (JWT) + bcrypt | — |
| PDF | ReportLab + pypdf | — |
| RUT | Pydantic field_validator (mod-11) | — |
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
│   └── app/Test/                   # Tests pytest (45 tests)
├── frontend/
│   └── src/
│       ├── api.tsx                 # Fetch wrapper + JWT
│       ├── App.tsx                 # Root: theme, routing, auth gate, React.lazy()
│       ├── services/authService.ts # Token management
│       ├── components/             # ErrorBoundary, Login, Navbar, forms (5)
│       ├── components/pages/       # Pages (6, lazy-loaded) + NotFound
│       ├── utils/                  # rut.ts, pdf.ts, excel.ts, error.ts, download.ts, pagination.ts
│       ├── constants/              # calles.ts (CALLES, RELACIONES)
│       └── test/                   # Tests vitest (23 tests)
└── database/
    ├── docker-compose.yaml         # PostgreSQL container
    └── scripts/init.sql            # Schema + seed data (2 vecinos)
```

## Decisiones de Arquitectura

1. **Auth obligatorio por defecto**: Solo 2 endpoints son públicos (`/api/token` y `/api/documentos/tipos`). Todos los demás requieren JWT.

2. **JWT en localStorage**: Simple pero vulnerable a XSS. Alternativa para V2: httpOnly cookies.

3. **RUT con mod-11**: Validación de formato y dígito verificador en backend (Pydantic `field_validator`).

4. **PDF con plantilla**: Se usa un PDF base (`certificado_plantilla.pdf`) y se superponen los datos con ReportLab + pypdf. Las coordenadas se ajustaron con una herramienta de desarrollo (`tool_posiciones.py`, eliminada del paquete de producción).

5. **autocommit=False en SQLAlchemy**: Manejo explícito de transacciones con `commit()`/`rollback()`.

6. **Seed data hardcodeada**: El `init.sql` contiene 35 vecinos de prueba con nombres, RUTs y direcciones variadas. Contraseñas generadas con pgcrypto (`crypt()`). El vecino #35 es el presidente.

7. **Lazy loading de páginas**: Las 6 páginas + NotFound usan `React.lazy()` + `<Suspense>`. El bundle inicial se redujo de ~1732 kB a ~654 kB (-62%).

8. **ExcelJS dinámico**: Se importa solo al hacer click en "Exportar" (~937 kB lazy, no en bundle inicial).

9. **Error Boundary**: Captura errores de renderizado y muestra pantalla de recuperación con botón de recarga.

10. **Auditoría completa**: Todas las mutaciones (CRUD vecinos, documentos, solicitudes, certificados, login) quedan registradas en el historial.
