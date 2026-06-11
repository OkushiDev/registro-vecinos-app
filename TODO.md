# TODO — Registro Vecinos App

Issues pendientes priorizados al cierre de sesión 2026-06-10.

---

## 🔴 Críticos (Seguridad)

### 1. JWT Secret Key: eliminar fallback hardcodeado

**Archivo:** `backend/app/core/security.py` línea 9

`SECRET_KEY = os.getenv("JWT_SECRET_KEY", "DEV_ONLY_CHANGE_IN_PRODUCTION")`

**Fix:** Que falle si no hay variable de entorno.

**Labels:** `security`, `backend`

---

### 2. DB Password: eliminar fallback hardcodeado

**Archivos:** `backend/app/api/database.py:8`, `database/docker-compose.yaml:5`

`postgres:1234@localhost` hardcodeado.

**Fix:** Leer de env vars sin fallback.

**Labels:** `security`, `backend`, `database`

---

### 3. Endpoints sin autenticación (6)

| Endpoint | Expone |
|----------|--------|
| `GET /lista-vecinos/` | Datos personales de todos los vecinos |
| `GET /vecino/{id}` | Datos de un vecino |
| `GET /historial/` | Auditoría completa |
| `GET /api/generar-certificado/{id}` | PDF con RUT, nombre, dirección — **sin auth ni logging** |

**Fix:** Agregar `Depends(get_current_user)`.

**Labels:** `security`, `backend`

---

## 🟡 Alta (Estabilidad)

### 4. Error Boundary

Cualquier error de renderizado = pantalla blanca.

**Labels:** `frontend`, `enhancement`

---

### 5. Ruta 404

Rutas inválidas redirigen silenciosamente.

**Labels:** `frontend`, `enhancement`

---

### 6. Store global (Zustand)

Comunicación entre componentes vía `window.dispatchEvent`. Sin tipado.

**Labels:** `frontend`, `refactor`

---

## 🟡 Media

### 7. UPLOAD_DIR duplicado

`main.py:13` (`Path("uploads")`) y `utils.py:10` (`Path("uploads/documentos")`).

**Labels:** `backend`, `refactor`

---

### 8. `formatear_fecha` inconsistente

Usado en vecinos.py y documentos.py, pero solicitudes.py, historial.py y auth.py usan `str()` o `.isoformat()` inline.

**Labels:** `backend`, `refactor`

---

### 9. RUT sin algoritmo mod-11

Solo valida formato (largo, dígitos, DV numérico/K), no el dígito verificador matemático.

**Labels:** `backend`, `enhancement`

---

## 🟢 Baja

### 10. Hardcoded `localhost:8000` en Antecedentes_vecino.tsx

Línea 429: `return \`http://localhost:8000/${rutaArchivo}\`` en `getDownloadUrl()`.

**Labels:** `frontend`, `bug`

---

### 11. `usuario` key redundante en localStorage

`Login.tsx:95`: `localStorage.setItem("usuario", JSON.stringify(response))` — duplica datos ya guardados. Se limpia en logout pero es innecesaria.

**Labels:** `frontend`, `refactor`

---

### 12. Componentes grandes

ListaVecinos (1003L), Antecedentes (872L), ListaSolicitudes (726L), Documentos (711L).

**Labels:** `frontend`, `refactor`

---

## Resumen

| # | Prioridad | Área | Título |
|---|-----------|------|--------|
| 1 | 🔴 Crítica | Backend | JWT Secret Key fallback |
| 2 | 🔴 Crítica | Backend/DB | DB Password hardcodeada |
| 3 | 🔴 Crítica | Backend | 6 endpoints sin autenticación |
| 4 | 🟡 Alta | Frontend | Error Boundary |
| 5 | 🟡 Alta | Frontend | Ruta 404 |
| 6 | 🟡 Alta | Frontend | Store global (Zustand) |
| 7 | 🟡 Media | Backend | UPLOAD_DIR duplicado |
| 8 | 🟡 Media | Backend | formatear_fecha inconsistente |
| 9 | 🟡 Media | Backend | RUT sin algoritmo mod-11 |
| 10 | 🟢 Baja | Frontend | localhost hardcodeado en Antecedentes |
| 11 | 🟢 Baja | Frontend | localStorage key extra |
| 12 | 🟢 Baja | Frontend | Componentes grandes |

---

## ✅ Ya resuelto (sesión 2026-06-10)

- ~~tools_posiciones.py sin documentar~~ → Documentado
- ~~RUT duplicado en Login.tsx~~ → Usa `utils/rut.ts`
- ~~fetch() + localhost hardcodeado en Documentos.tsx~~ → Axios + `descargarPDF()`
- ~~Sin tests de frontend~~ → 21 tests con vitest
- ~~Dual axios~~ → Unificado en `api.tsx`
- ~~Inconsistencia `token` vs `access_token`~~ → Unificado
- ~~useEffect leak en ListaSolicitudes~~ → useCallback
- ~~main.py monolito~~ → Routers separados
- ~~requirements.txt inconsistente~~ → Solo pyproject.toml
- ~~Bundle inicial pesado~~ → React.lazy() + exceljs dinámico: 661 kB (-62%)
- ~~CALLES/RELACIONES duplicados 3×~~ → `src/constants/calles.ts`
- ~~StatCards repetidas~~ → Componente `StatCard.tsx`
- ~~`formatear_fecha` duplicada~~ → Unificada en `utils.py`
- ~~Ruta `/vecino/subir-archivo` inalcanzable~~ → `*` al final del bloque
- ~~Sort roto en columnas no-id~~ → Sort genérico
- ~~Index-as-key en 3 archivos~~ → Keys estables
- ~~`role="checkbox"` falso~~ → Eliminado
- ~~`target="_blank"` sin `rel="noopener"`~~ → Agregado
- ~~Vecino 403 al verificar solicitudes~~ → Nuevo endpoint `mi-pendiente`
- ~~Solicitudes sin auditoría~~ → `registrar_accion` en 4 endpoints
- ~~Backend sin validación RUT~~ → `field_validator` en schemas
- ~~`str(fecha)` inconsistente~~ → `formatear_fecha` en obtener_vecino y listar_mis_documentos
- ~~Tests dependientes de DB real~~ → Mock + dependency_overrides
- ~~Tests con funciones falsas~~ → Reescritos con imports reales
