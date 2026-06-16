# TODO — Registro Vecinos App

Issues pendientes al cierre de sesión 2026-06-10 (branch `fix/remaining-issues`).

---

## 🔴 Críticos (Seguridad)

### 1. JWT Secret Key: eliminar fallback hardcodeado

`backend/app/core/security.py` línea 9: `os.getenv("JWT_SECRET_KEY", "DEV_ONLY_CHANGE_IN_PRODUCTION")`

**Fix:** Que falle si no hay variable de entorno.

---

### 2. DB Password: eliminar fallback hardcodeado

`backend/app/api/database.py:8`, `database/docker-compose.yaml:5` — `postgres:1234` hardcodeado.

**Fix:** Leer de env vars.

---

## 🟡 Alta

### 3. Crear AuthContext

Migrar `App.tsx` y `Navbar.tsx` a React Context para eliminar `useState` + paso de props con el estado de autenticación y tema.

---

### 4. Split de componentes grandes

ListaVecinos (1003L), Antecedentes (872L), ListaSolicitudes (726L), Documentos (711L). Extraer sub-componentes y hooks.

---

## Resumen

| # | Prioridad | Área | Título |
|---|-----------|------|--------|
| 1 | 🔴 Crítica | Backend | JWT Secret Key fallback |
| 2 | 🔴 Crítica | Backend/DB | DB Password hardcodeada |
| 3 | 🟡 Alta | Frontend | Migrar a AuthContext |
| 4 | 🟡 Alta | Frontend | Split componentes grandes |

---

## ✅ Ya resuelto (branch `fix/remaining-issues`)

- ~~Hardcoded `localhost:8000` en Antecedentes~~ → Usa `VITE_API_URL`
- ~~Key `"usuario"` redundante en localStorage~~ → Eliminada, usa `vecino_id`
- ~~UPLOAD_DIR duplicado~~ → `UPLOAD_BASE` unificado en `utils.py`
- ~~`formatear_fecha` inconsistente~~ → Ahora en historial.py y auth.py
- ~~RUT sin algoritmo mod-11~~ → `field_validator` con mod-11 en schemas
- ~~Sin Error Boundary~~ → Componente `ErrorBoundary.tsx`
- ~~Sin 404 route~~ → Componente `NotFound.tsx`
- ~~6 endpoints sin auth~~ → Protegidos con `Depends(get_current_user)`
- ~~Certificados sin auditoría~~ → `registrar_accion` agregado
- ~~Store global inexistente~~ → Evaluado (React Context elegido sobre Zustand)
