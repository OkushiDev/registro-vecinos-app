# Backend — Registro Vecinos API

FastAPI + SQLAlchemy + PostgreSQL. Gestionado con `uv`.

## Stack

- **Framework:** FastAPI (con `fastapi[standard]`: incluye uvicorn, pydantic, python-multipart)
- **ORM:** SQLAlchemy 2.0
- **BD:** PostgreSQL via psycopg2-binary
- **Auth:** JWT (python-jose + bcrypt)
- **PDF:** ReportLab + PyPDF2
- **Tests:** pytest
- **Gestor:** uv

## Setup rápido

```bash
# 1. Sincronizar dependencias
uv sync --dev

# 2. Configurar variables de entorno (opcional, hay defaults para dev)
cp .env.example .env

# 3. Iniciar PostgreSQL (Docker)
docker compose -f ../database/docker-compose.yaml up -d

# 4. Iniciar servidor
uv run uvicorn app.api.main:app --reload --port 8000
```

Sin Docker, asegúrate de tener PostgreSQL corriendo en `localhost:5432` con usuario `postgres` y contraseña `1234` (o configura `DATABASE_URL` en `.env`).

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/postgres` | Conexión a BD |
| `JWT_SECRET_KEY` | `DEV_ONLY_CHANGE_IN_PRODUCTION` | Clave para firmar tokens |

## Estructura del proyecto

```
backend/
├── app/
│   ├── api/
│   │   ├── main.py              # Bootstrap: FastAPI app, CORS, monta routers
│   │   ├── schemas.py           # Pydantic models (request/response)
│   │   ├── dependencies.py      # get_current_user, oauth2_scheme
│   │   ├── utils.py             # Helpers: registrar_accion, validate_file, etc.
│   │   ├── models.py            # SQLAlchemy models (Vecino, Usuario, Documento, etc.)
│   │   ├── database.py          # Engine, SessionLocal, get_db
│   │   ├── certificados.py      # Router: generación de PDF (plantilla)
│   │   ├── routers/
│   │   │   ├── auth.py          # /api/token, /api/me
│   │   │   ├── vecinos.py       # CRUD vecinos, estado, número socio
│   │   │   ├── documentos.py    # Subida, descarga, listado de documentos
│   │   │   ├── solicitudes.py   # Solicitudes de certificados
│   │   │   └── historial.py     # Historial de acciones
│   │   └── tool_posiciones.py   # Herramienta dev para coordenadas PDF
│   ├── core/
│   │   └── security.py          # JWT: create/decode token, hash/verify password
│   └── resources/
│       └── certificado_plantilla.pdf
├── pyproject.toml               # Dependencias (única fuente)
├── .env                         # Variables locales (no commiteado)
└── .gitignore
```

## Convenciones

### Cómo agregar un endpoint

```python
# 1. En el router correspondiente (o crear uno nuevo en routers/)
from fastapi import APIRouter, Depends
from app.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/mi-recurso", tags=["mi-recurso"])

@router.get("/")
async def listar(db: Session = Depends(get_db)):
    ...

@router.post("/")
async def crear(
    payload: MiSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # si requiere auth
):
    ...

# 2. Registrar en main.py
from app.api.routers import mi_recurso
app.include_router(mi_recurso.router)
```

### Seguridad

- Todos los endpoints que modifican datos **deben** incluir `current_user: dict = Depends(get_current_user)`
- La contraseña se almacena hasheada con bcrypt (nunca en texto plano)
- El token JWT expira en 480 minutos (8 horas)
- `SECRET_KEY` debe cambiarse en producción vía variable de entorno

### Historial

Usar `registrar_accion(db, usuario_id, descripcion, tipo)` para auditar operaciones importantes. Los tipos comunes: `"Login"`, `"Creacion"`, `"EDICION"`, `"Estado"`, `"DOCUMENTO"`, `"SOLICITUD"`.

## Tests

```bash
uv run pytest
```

Los tests de integración (`test_crud.py`) se conectan a la BD real. Para aislarlos, sobrescribe la dependencia `get_db`:

```python
from app.api.dependencies import get_db

def override_get_db():
    ...
    yield test_db

app.dependency_overrides[get_db] = override_get_db
```
