# TODO — Registro Vecinos App

Sin issues pendientes al 2026-11-13.

## Resuelto

- Crear AuthContext → `AuthProvider` + `useAuth` en `frontend/src/context/`.
- Split de componentes grandes → ListaVecinos 365L, Antecedentes 451L,
  ListaSolicitudes 283L, Documentos 139L; subcomponentes en `pages/*/`.
- Hardcoded `localhost:8000` en Antecedentes → usa `VITE_API_URL`.
- Key `"usuario"` redundante en localStorage → eliminada, usa `vecino_id`.
- `UPLOAD_DIR` duplicado → `UPLOAD_BASE` unificado en `utils.py`.
- `formatear_fecha` inconsistente → fuente única en `utils.py`; timestamps con
  `formatear_fecha_hora` en `America/Santiago`.
- RUT sin algoritmo mod-11 → `field_validator` con mod-11 en schemas.
- Sin Error Boundary → componente `ErrorBoundary.tsx`.
- Sin 404 route → componente `NotFound.tsx`.
- 6 endpoints sin auth → protegidos con `Depends(get_current_user)`.
- Certificados sin auditoría → `registrar_accion` agregado.
- Store global inexistente → React Context implementado para auth/tema.
- JWT Secret Key fallback hardcodeado → `os.environ[]` lanza error si no hay
  env var.
- DB Password hardcodeada → `database.py` usa `os.environ[]`; docker-compose
  usa `${POSTGRES_PASSWORD:-1234}`.
