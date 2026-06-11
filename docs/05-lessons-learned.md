# Lecciones Aprendidas — Para V2

Checklist de lo que NO repetir en una eventual reescritura del proyecto.

## Seguridad

### ❌ JWT Secret Key con fallback hardcodeado
`SECRET_KEY = os.getenv("JWT_SECRET_KEY", "DEV_ONLY_CHANGE_IN_PRODUCTION")`

**En V2:** Que falle si no hay variable de entorno. No tener default.

### ❌ Contraseña de BD en código
`DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/postgres")`

**En V2:** Usar variables de entorno siempre. El docker-compose también debería leer `POSTGRES_PASSWORD` de un `.env`.

### ❌ Endpoints sin autenticación
`/lista-vecinos/`, `/vecino/{id}`, `/historial/`, `/api/generar-certificado/{id}` no requieren token.

**En V2:** Todo endpoint debe requerir auth por defecto. Solo rutas explícitamente públicas (login, docs) deben permitir acceso anónimo.

### ❌ JWT en localStorage
Vulnerable a XSS.

**En V2:** Usar httpOnly cookies con CSRF token.

## Arquitectura Backend

### ❌ main.py con todo
Estado inicial: 1907 líneas. Refactorizado a 51 líneas con routers.

**En V2:** Separar en routers desde el día 1. Cada router en su archivo.

### ❌ UPLOAD_DIR duplicado
`main.py` define `Path("uploads")`, `utils.py` define `Path("uploads/documentos)`. Coincidencia accidental.

**En V2:** Una sola fuente de verdad para paths.

### ❌ tool_posiciones.py suelto
Script de desarrollo para calibrar coordenadas PDF, pero ubicado dentro del módulo API.

**En V2:** Scripts de desarrollo van en `scripts/` o `tools/`, no dentro del paquete de producción.

### ❌ Tests que dependen de DB real
Los tests de integración requieren PostgreSQL funcionando, no se pueden correr aislados en CI fácilmente.

**En V2:** Usar SQLite in-memory para tests o mocking con `dependency_overrides`.

## Arquitectura Frontend

### ❌ Sin store global
Comunicación entre componentes vía `window.dispatchEvent`.

**En V2:** Usar Zustand o React Context para estado compartido (usuario actual, notificaciones).

### ❌ Sin Error Boundary
Cualquier error de renderizado React rompe la app completamente (pantalla blanca).

**En V2:** Agregar Error Boundary desde el inicio.

### ❌ Sin ruta 404
Rutas inválidas redirigen silenciosamente.

**En V2:** Agregar `<Route path="*" element={<NotFound />} />`.

### ❌ localStorage keys inconsistentes
Originalmente coexistían `"token"` y `"access_token"`.

**En V2:** Definir constantes para todas las keys de storage.

### ❌ URLs hardcodeadas
`localhost:8000` en varios archivos del frontend (Documentos, Antecedentes_vecino) en vez de usar la variable de entorno `VITE_API_URL`.

**En V2:** Usar siempre la instancia axios (que ya lee de env var).

### ❌ fetch() directo
Algunos componentes usaban `fetch()` en vez del interceptor axios, saltándose el manejo de tokens.

**En V2:** Un solo cliente HTTP con interceptores. No permitir `fetch()` directo.

## Código Duplicado

### ❌ Lógica de RUT inline
Login.tsx tenía su propia lógica de limpieza/formateo de RUT duplicando `src/utils/rut.ts`.

**En V2:** Identificar utilidades compartidas temprano y centralizarlas.

### ❌ Lógica de PDF download inline
Documentos.tsx tenía su propia implementación de blob download duplicando `src/utils/pdf.ts`.

**En V2:** Las utilidades de descarga/export deben estar en `utils/` desde el principio.

## Testing

### ❌ Sin tests de frontend
28 tests backend, 0 tests frontend hasta hoy.

**En V2:** Configurar Vitest + Testing Library al iniciar el proyecto. Escribir tests junto con el código.

## Convenciones

### ✅ Cosas que funcionaron bien (mantener en V2)

- **FastAPI + SQLAlchemy**: Buena combinación. Mantener.
- **Pydantic schemas**: Validación de datos clara. Separar request/response schemas.
- **uv como gestor**: Rápido y confiable. Superior a pip/poetry para este proyecto.
- **JWT con 8h de expiración**: Práctico para desarrollo. En producción podría reducirse.
- **Historial de auditoría**: Todas las acciones importantes quedan registradas.
- **Code-splitting en Vite**: MUI y ExcelJS en chunks separados. Bueno para performance.
- **Utilidades centralizadas**: RUT, PDF, Excel en `utils/`. Este patrón funcionó bien.
- **RUT chileno como username**: Práctico y evita crear otro identificador.

## Resumen para V2

| Prioridad | Acción |
|-----------|--------|
| 🔴 Crítica | Mover JWT + DB password a env vars, sin fallbacks |
| 🔴 Crítica | Autenticar todos los endpoints por defecto |
| 🔴 Crítica | Reemplazar localStorage JWT por httpOnly cookies |
| 🟡 Alta | Agregar Error Boundary + ruta 404 |
| 🟡 Alta | Store global (Zustand) para estado compartido |
| 🟡 Alta | Configurar tests frontend desde el día 1 |
| 🟢 Media | Unificar paths en una sola fuente de verdad |
| 🟢 Media | Scripts de desarrollo en `scripts/` |
| 🟢 Media | URLs dinámicas via env var, nunca hardcodeadas |
