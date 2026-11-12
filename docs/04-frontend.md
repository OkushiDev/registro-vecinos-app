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
            │   └─ Modal: RegistroVecinoForm (create/edit)
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

### api.tsx — Fetch Wrapper

Wrapper nativo sobre `fetch()` que agrega JWT automáticamente y mantiene interfaz compatible (`.data`, `.headers`, `.status`). Reemplaza a axios.

### services/authService.ts

| Método | Descripción |
|--------|-------------|
| `login(credentials)` | POST /api/token, guarda token + rol + user_id + vecino_id + nombre_completo en localStorage |
| `getCurrentUser()` | GET /api/me |
| `logout()` | Limpia todo del localStorage |
| `getToken()` | Retorna `access_token` |
| `isAuthenticated()` | `!!getToken()` |

### src/utils/

| Archivo | Funciones |
|---------|-----------|
| `rut.ts` | `limpiarRut`, `formatearRut`, `formatearRutConPuntos`, `validarFormatoRut` |
| `pdf.ts` | `descargarPDF(blob, contentDisposition, defaultName?)` |
| `excel.ts` | `exportarAExcel(data, sheetName, fileName)` — importa ExcelJS dinámicamente (~1MB, solo al exportar) |
| `error.ts` | `getErrorMessage(error)` — mensajes de error uniformes |
| `download.ts` | `descargarBlob(blob, fileName)` — descarga genérica de blobs |
| `pagination.ts` | `displayedRowsLabel`, `usePagination()` — paginación y etiqueta compartida |

### src/constants/

| Archivo | Contenido |
|---------|-----------|
| `calles.ts` | `CALLES`, `RELACIONES_PROPIEDAD` — arrays compartidos en formularios y filtros |

## Optimizaciones de Performance (2026-06-10)

| Optimización | Impacto |
|-------------|---------|
| `React.lazy()` en 6 páginas + NotFound | Bundle inicial reducido **62%** (~1732 kB → ~654 kB) |
| `import("exceljs")` dinámico | 937 kB fuera del bundle inicial, solo al exportar |
| `StatCard` → inline | 4 tarjetas de estadísticas inline en ListaSolicitudes, -38 líneas |
| `CALLES`/`RELACIONES` a `constants/` | Fuente única, -58 líneas de duplicación |

## Robustez (2026-06-10)

| Feature | Descripción |
|---------|-------------|
| `ErrorBoundary` | Captura errores de renderizado, muestra mensaje amigable + botón recargar |
| `NotFound` (404) | Página para rutas inexistentes, reemplaza redirects silenciosos |
| `AuthContext` | Store global vía React Context (infraestructura lista, migración pendiente) |

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
