# Backend — Registro Vecinos API

FastAPI + SQLAlchemy + PostgreSQL. Gestionado con `uv`.

## Stack

- **Framework:** FastAPI 0.136 (con `fastapi[standard]`: incluye uvicorn, pydantic, python-multipart)
- **ORM:** SQLAlchemy 2.0
- **BD:** PostgreSQL via psycopg2-binary
- **Auth:** JWT (python-jose + bcrypt)
- **Validación:** Pydantic v2 con `field_validator` (RUT mod-11)
- **PDF:** ReportLab + PyPDF2
- **Tests:** pytest (28 tests con Mock + dependency_overrides)
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
uv run uvicorn app.api.main:app --reload --port 8000 --env-file .env
```

Documentación de la API en `http://localhost:8000/docs`.

Sin Docker, asegúrate de tener PostgreSQL corriendo en `localhost:5432` con usuario `postgres` y contraseña `1234` (o configura `DATABASE_URL` en `.env`).

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/postgres` | Conexión a BD |
| `JWT_SECRET_KEY` | `DEV_ONLY_CHANGE_IN_PRODUCTION` | ⚠️ Cambiar en producción |

## Endpoints

### Auth (públicos)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/token` | POST | Login — retorna JWT |
| `/api/documentos/tipos` | GET | Lista estática de tipos de documento |

### Vecinos (auth requerido)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/lista-vecinos/` | GET | Lista todos los vecinos |
| `/vecino/{id}` | GET | Obtener vecino por ID |
| `/agregar-vecino/` | POST | Crear vecino + usuario |
| `/editar-vecino/{id}` | PUT | Editar vecino (con cambio de password opcional) |
| `/cambiar-estado-vecino/{id}` | PATCH | Habilitar/deshabilitar vecino |
| `/siguiente-numero-socio/` | GET | Próximo número de socio |

### Documentos (auth requerido)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/documentos/mis-documentos` | GET | Documentos del usuario actual |
| `/api/documentos/subir` | POST | Subir archivo (PDF/PNG/JPG, max 5MB) |
| `/api/documentos/vecino/{id}` | GET | Documentos de un vecino |
| `/api/documentos/descargar/{id}` | GET | Descargar documento |
| `/api/documentos/{id}` | DELETE | Eliminar documento |

### Solicitudes (auth requerido)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/solicitudes` | GET | Listar todas (presidente) |
| `/api/solicitudes/mi-pendiente` | GET | ¿Tiene pendiente el usuario actual? |
| `/api/solicitudes/crear` | POST | Crear solicitud (vecino) |
| `/api/solicitudes/crear-por-presidente` | POST | Crear para otro vecino |
| `/api/solicitudes/notificaciones` | GET | Notificaciones (presidente) |
| `/api/solicitudes/{id}/ocultar` | PATCH | Ocultar notificación |
| `/api/solicitudes/{id}/rechazar` | PATCH | Rechazar solicitud |
| `/api/solicitudes/{id}/marcar-realizada` | PATCH | Marcar como realizada |

### Otros (auth requerido)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/historial/` | GET | Auditoría completa |
| `/historial/` | POST | Crear entrada manual |
| `/api/generar-certificado/{id}` | GET | Generar PDF certificado |

## Auth Flow

```
POST /api/token (username=RUT, password)
  → bcrypt.verify(password, hash_de_BD)
    → hash_de_BD usa prefijo $2a$ (pgcrypto)
    → backend lo normaliza a $2b$ en security.py:23
  → genera JWT con expiración 8h
  → cliente almacena token en localStorage
```

### Seed — cómo funcionan las contraseñas

El `init.sql` inserta contraseñas usando `pgcrypto`:

```sql
crypt('Bolados1353', gen_salt('bf', 8))  → $2a$...
```

Esto genera hashes con formato `$2a$`. El backend usa Python + bcrypt que espera `$2b$`. La compatibilidad se resuelve en `app/core/security.py:23`:

```python
stored_hash = stored_hash.replace("$2a$", "$2b$")
```

**Fórmula de contraseñas seed:** `ApellidoPaterno + primeros 4 dígitos del RUT`
- Ej: `Bolados1353` para RUT `13532259-8`
- Ej: `Benavides1430` para RUT `14306046-2` (presidente)

## Estructura del proyecto

```
backend/
├── app/
│   ├── api/
│   │   ├── main.py              # Bootstrap: FastAPI app, CORS, routers
│   │   ├── schemas.py           # Pydantic + validación RUT mod-11
│   │   ├── dependencies.py      # get_current_user, oauth2_scheme
│   │   ├── utils.py             # Helpers: registrar_accion, formatear_fecha, validate_file
│   │   ├── models.py            # SQLAlchemy ORM (Vecino, Usuario, Documento, etc.)
│   │   ├── database.py          # Engine, SessionLocal, get_db
│   │   ├── certificados.py      # Generación PDF con plantilla
│   │   └── routers/
│   │       ├── auth.py          # /api/token, /api/me
│   │       ├── vecinos.py       # CRUD vecinos, estado, número socio
│   │       ├── documentos.py    # Subida, descarga, listado de documentos
│   │       ├── solicitudes.py   # Solicitudes de certificados
│   │       └── historial.py     # Historial de acciones
│   ├── core/
│   │   └── security.py          # JWT: create/decode token, bcrypt hash/verify
│   └── resources/
│       └── certificado_plantilla.pdf
├── app/Test/                    # Tests pytest (28)
├── pyproject.toml               # Dependencias
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
async def listar(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # requerido por defecto
):
    ...

# 2. Registrar en main.py
from app.api.routers import mi_recurso
app.include_router(mi_recurso.router)
```

### Seguridad

- **Todos los endpoints requieren auth por defecto**. Solo 2 son públicos: `/api/token` (login) y `/api/documentos/tipos` (lista estática).
- La contraseña se almacena hasheada con bcrypt (nunca en texto plano).
- El token JWT expira en 480 minutos (8 horas).
- `SECRET_KEY` **debe** cambiarse en producción vía variable de entorno (el default es solo para desarrollo).
- El RUT se valida con algoritmo mod-11 en `schemas.py` (`field_validator`).

### Historial

Usar `registrar_accion(db, usuario_id, descripcion, tipo)` para auditar todas las mutaciones. Tipos: `"Login"`, `"Creacion"`, `"EDICION"`, `"Estado"`, `"DOCUMENTO"`, `"SOLICITUD"`, `"CERTIFICADO"`.

### Fechas

Usar `formatear_fecha(fecha_obj, fmt="%d-%m-%Y", default="-")` de `utils.py` para formateo consistente.

## Tests

```bash
uv run pytest app/Test/
```

28 tests con `Mock` + `dependency_overrides`. No requieren PostgreSQL real. Para correr tests de integración contra BD:

```python
from app.api.dependencies import get_db

def override_get_db():
    ...
    yield test_db

app.dependency_overrides[get_db] = override_get_db
```
