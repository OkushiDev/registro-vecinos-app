# TODO — Registro Vecinos App

Issues pendientes priorizados. Para importar a GitHub Issues, cada sección tiene título y cuerpo listos para copiar/pegar.

---

## 🔴 Críticos (Seguridad)

### 1. JWT Secret Key: eliminar fallback hardcodeado

**Archivo:** `backend/app/core/security.py` línea 9

```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "DEV_ONLY_CHANGE_IN_PRODUCTION")
```

Si no se define `JWT_SECRET_KEY`, cualquiera con acceso al repo puede firmar JWTs válidos.

**Fix:** Que falle con `KeyError` o `raise` explícito si no hay variable de entorno. El `.env.example` ya documenta la variable.

**Labels:** `security`, `backend`

---

### 2. DB Password: eliminar fallback hardcodeado

**Archivos:**
- `backend/app/api/database.py` línea 8 — fallback de `DATABASE_URL` con `postgres:1234@localhost`
- `database/docker-compose.yaml` — `POSTGRES_PASSWORD: 1234`

**Fix:** Leer de variables de entorno. `docker-compose` debería usar `${POSTGRES_PASSWORD:-error}`.

**Labels:** `security`, `backend`, `database`

---

### 3. Endpoints sin autenticación

Los siguientes endpoints NO requieren token JWT, exponiendo datos sensibles:

| Endpoint | Expone |
|----------|--------|
| `GET /lista-vecinos/` | Datos personales de todos los vecinos |
| `GET /vecino/{id}` | Datos de un vecino específico |
| `GET /historial/` | Auditoría completa del sistema |
| `GET /api/generar-certificado/{id}` | Certificados sin restricción |

**Fix:** Agregar `Depends(get_current_user)` a estos endpoints. El `/api/generar-certificado/{id}` puede requerir que el vecino solicite el suyo propio.

**Labels:** `security`, `backend`

---

## 🟡 Alta (Estabilidad Frontend)

### 4. Error Boundary

**Descripción:** Cualquier error de renderizado en React rompe toda la app (pantalla blanca). No hay feedback para el usuario.

**Fix:** Crear un componente `ErrorBoundary` (class component con `componentDidCatch`) que muestre un mensaje amigable y un botón de recarga.

**Labels:** `frontend`, `enhancement`

---

### 5. Ruta 404

**Descripción:** Rutas inválidas redirigen silenciosamente en vez de mostrar una página de error.

**Archivo:** `frontend/src/App.tsx`

**Fix:** Agregar `<Route path="*" element={<NotFound />} />` con un componente simple que muestre "Página no encontrada" y un link al inicio.

**Labels:** `frontend`, `enhancement`

---

### 6. Store global (Zustand)

**Descripción:** La comunicación entre componentes se hace con `window.dispatchEvent` (eventos custom). No hay estado compartido tipado.

**Fix:** Agregar Zustand (`npm install zustand`) y migrar:
- Estado de autenticación (user, rol)
- Notificaciones (reemplazar eventos custom)
- Tema (dark/light)

**Labels:** `frontend`, `refactor`

---

## 🟡 Media (Backend)

### 7. Tests: dependencia de DB real

**Descripción:** Los tests de integración requieren PostgreSQL funcionando en `localhost:5432`. No se pueden correr en CI sin configurar la BD.

**Fix:** Usar `dependency_overrides` para inyectar una SQLite in-memory o un engine de test. Ver `backend/README.md` que ya documenta el patrón.

**Labels:** `backend`, `testing`

---

### 8. Tests: funciones falsas inline

**Descripción:** Algunos tests de validación usan funciones falsas definidas inline en vez de probar el código real (`verify_password`, etc.).

**Fix:** Importar las funciones reales desde `app.core.security` en vez de reimplementarlas en los tests.

**Labels:** `backend`, `testing`

---

### 9. UPLOAD_DIR duplicado

**Archivos:**
- `backend/app/api/main.py:13` — `UPLOAD_DIR = Path("uploads")`
- `backend/app/api/utils.py:10` — `UPLOAD_DIR = Path("uploads/documentos")`

**Descripción:** El primero es para el static mount de FastAPI, el segundo para subida de documentos. Funcionan, pero no está claro cuál es la fuente de verdad.

**Fix:** Definir `UPLOAD_DIR` en un solo lugar (ej: en `utils.py` y exportarlo), o en una config central.

**Labels:** `backend`, `refactor`

---

## 🟢 Media/Baja (Frontend)

### 10. Hardcoded `localhost:8000` en Antecedentes_vecino.tsx

**Archivo:** `frontend/src/components/pages/Antecedentes_vecino.tsx` línea 433

```tsx
return `http://localhost:8000/${rutaArchivo.replace(/\\/g, "/")}`;
```

**Fix:** Usar `import.meta.env.VITE_API_URL` o la baseURL de la instancia `api`.

**Labels:** `frontend`, `bug`

---

### 11. Login.tsuarios guarda `"usuario"` extra en localStorage

**Archivo:** `frontend/src/components/Login.tsx` línea 99

```tsx
localStorage.setItem("usuario", JSON.stringify(response));
```

**Descripción:** Además de `access_token`, guarda una key `"usuario"` que no se limpia en logout ni se usa en otras partes del código.

**Fix:** Eliminar esa línea — el `authService.login()` ya persiste `access_token`, `rol`, `user_id`, `vecino_id` y `nombre_completo`.

**Labels:** `frontend`, `refactor`

---

### 12. Componentes grandes

**Archivos:**
- `frontend/src/components/pages/Documentos.tsx` — ~700 líneas
- `frontend/src/components/pages/ListaSolicitudes.tsx` — ~330 líneas
- `frontend/src/components/pages/ListaVecinos.tsx` — ~850 líneas

**Descripción:** Componentes monolíticos que mezclan lógica de negocio con UI. Dificulta testing y mantenimiento.

**Fix:** Extraer hooks personalizados (ej: `useDocumentos`, `useSolicitudes`, `useVecinos`) y subcomponentes.

**Labels:** `frontend`, `refactor`

---

## Resumen

| # | Prioridad | Área | Título |
|---|-----------|------|--------|
| 1 | 🔴 Crítica | Backend | JWT Secret Key fallback |
| 2 | 🔴 Crítica | Backend/DB | DB Password hardcodeada |
| 3 | 🔴 Crítica | Backend | Endpoints sin autenticación |
| 4 | 🟡 Alta | Frontend | Error Boundary |
| 5 | 🟡 Alta | Frontend | Ruta 404 |
| 6 | 🟡 Alta | Frontend | Store global (Zustand) |
| 7 | 🟡 Media | Backend | Tests dependientes de DB |
| 8 | 🟡 Media | Backend | Tests con funciones falsas |
| 9 | 🟡 Media | Backend | UPLOAD_DIR duplicado |
| 10 | 🟢 Media/Baja | Frontend | localhost hardcodeado en Antecedentes |
| 11 | 🟢 Media/Baja | Frontend | localStorage key extra |
| 12 | 🟢 Media/Baja | Frontend | Componentes grandes |

---

## ✅ Ya resuelto (hoy 2026-06-10)

- ~~tools_posiciones.py sin documentar~~ → Documentado
- ~~RUT duplicado en Login.tsx~~ → Usa `utils/rut.ts`
- ~~fetch() + localhost hardcodeado en Documentos.tsx~~ → Usa axios + `descargarPDF()`
- ~~Sin tests de frontend~~ → 21 tests con vitest
- ~~Dual axios~~ → Unificado en `api.tsx`
- ~~Inconsistencia `token` vs `access_token`~~ → Unificado
- ~~useEffect leak en ListaSolicitudes~~ → useCallback agregado
- ~~main.py monolito~~ → Router separados
- ~~requirements.txt inconsistente~~ → Eliminado
