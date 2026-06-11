# Frontend Architecture

## Entry Point

`src/main.tsx` → Renderiza `<App />` en StrictMode.

## App.tsx — Root Component

Controla: tema (dark/light), autenticación, routing.

### Flujo de carga

```
main.tsx
  └─ App.tsx
       ├─ isLoading = true → CircularProgress (full screen)
       ├─ !isAuthenticated → <Login onLogin={...} />
       └─ isAuthenticated →
            ├─ <Navbar /> (siempre visible arriba)
            └─ <Routes> (según rol)
```

### Routing por rol

```
/presidente/vecinos          → ListaVecinos
/presidente/documentos       → Documentos
/presidente/solicitudes      → ListaSolicitudes
/presidente/historial        → Historial
/presidente/antecedentes-vecino → AntecedentesVecino
/presidente/subir-archivo    → SubirDocumento

/vecino/antecedentes-vecino  → AntecedentesVecino
/vecino/subir-archivo        → SubirDocumento
```

## Theme

MUI 7 con `createTheme`. Dark mode toggle via `isDarkMode` state.

| Modo | Background default | Paper |
|------|-------------------|-------|
| Dark | `#0b1121` | `#1e293b` |
| Light | `#f1f5f9` | `#ffffff` |

## Component Tree

```
<ThemeProvider>
  <CssBaseline />
  <BrowserRouter>
    ┌─ Login (cuando no autenticado)
    │   ├─ Form: RUT + password
    │   ├─ Theme toggle (esquina)
    │   └─ Features list (solo desktop)
    │
    └─ App principal (cuando autenticado)
        ├─ <Navbar>
        │   ├─ Logo: "Villa Florencia"
        │   ├─ Navigation links por rol
        │   ├─ NotificationMenu (solo presidente)
        │   ├─ Theme toggle button
        │   └─ Avatar + logout menu
        │
        └─ <Routes>
            ├─ ListaVecinos
            │   ├─ Table con búsqueda/filtros
            │   ├─ Exportar Excel
            │   └─ Modales: RegistroVecinoForm, EditarVecinoForm
            │
            ├─ Documentos
            │   ├─ Selector de vecino (sidebar)
            │   └─ Tabla de documentos + descarga
            │
            ├─ ListaSolicitudes
            │   ├─ Tabla con filtros
            │   ├─ Aprobar/Rechazar
            │   ├─ Generar certificado PDF
            │   └─ Exportar Excel
            │
            ├─ Historial
            │   └─ Tabla de auditoría + Exportar Excel
            │
            ├─ AntecedentesVecino
            │   ├─ Datos del vecino (read-only)
            │   └─ Botón generar certificado
            │
            └─ SubirDocumento
                └─ Form: tipo documento + archivo
```

## Servicios y Utilidades

### api.tsx — Axios Instance

```tsx
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

// Interceptor request: attach Bearer token
// Interceptor response: log 401 errors
```

### services/authService.ts

| Método | Descripción |
|--------|-------------|
| `login(credentials)` | POST /api/token, guarda token + rol + user_id + vecino_id + nombre_completo en localStorage |
| `getCurrentUser()` | GET /api/me |
| `logout()` | Limpia todo del localStorage |
| `getToken()` | Retorna `access_token` |
| `getRol()` | Retorna rol del usuario |
| `isAuthenticated()` | `!!getToken()` |
| `isPresidente()` / `isVecino()` | Check de rol |

### src/utils/

| Archivo | Funciones |
|---------|-----------|
| `rut.ts` | `limpiarRut`, `formatearRut`, `formatearRutConPuntos`, `validarFormatoRut` |
| `pdf.ts` | `descargarPDF(blob, contentDisposition, defaultName?)` |
| `excel.ts` | `exportarAExcel(data, sheetName, fileName)` — usa ExcelJS |

## Estado y Comunicación entre Componentes

No hay store global. Se usan:

- **useState / useReducer** — estado local de cada componente
- **useEffect** — carga inicial de datos, polling de notificaciones
- **window.dispatchEvent** — eventos custom para comunicación cruzada:
  - `"solicitudActualizada"` — notifica a ListaSolicitudes que refresque
  - `"documentosActualizados"` — notifica a Documentos que refresque

## Tests

```bash
cd frontend
npm test        # vitest run (CI)
npm run test:watch  # vitest (watch mode)
```

Actualmente 21 tests para utilidades:
- `rut.test.ts` — 16 tests (limpieza, formato, validación)
- `pdf.test.ts` — 3 tests (descarga con/sin Content-Disposition)
- `excel.test.ts` — 2 tests (datos vacíos, exportación básica)

## Notas sobre MUI 7

MUI 7 cambió Grid a Grid2 con API diferente. Prestar atención al migrar o copiar código de tutorials:

| Versión | Sintaxis |
|---------|----------|
| MUI 5/6 | `<Grid item xs={12} md={6}>` |
| MUI 7 | `<Grid size={{ xs: 12, md: 6 }}>` |

El bundle tiene code-splitting: MUI y ExcelJS van en chunks separados (`vite.config.ts`).
