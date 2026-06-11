# Frontend — Registro Vecinos App

React 19 + TypeScript + Vite 7 + MUI 7. Gestionado con npm.

## Stack

- **Framework:** React 19.2 + TypeScript 5.9
- **Build:** Vite 7
- **UI:** MUI 7 (Material-UI) + Emotion
- **Routing:** react-router-dom 7
- **HTTP:** Axios (instancia única con interceptor JWT)
- **Excel:** ExcelJS 4.x (lazy-loaded, ~937 kB)
- **Tests:** Vitest 4 + Testing Library (21 tests)
- **Lint:** ESLint 9 + typescript-eslint

## Setup rápido

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Abrir http://localhost:5173
```

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL base del backend |

Se configuran en `.env`. Este archivo está en `.gitignore`.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root: theme, routing, auth, lazy routes, ErrorBoundary
│   ├── api.tsx                   # Instancia axios única (interceptor JWT)
│   ├── services/
│   │   └── authService.ts        # Login, logout, token management
│   ├── components/
│   │   ├── ErrorBoundary.tsx     # Crash recovery
│   │   ├── Navbar.tsx            # AppBar con navegación + theme toggle
│   │   ├── Login.tsx             # Pantalla de login
│   │   ├── Modal.tsx             # Modal genérico reutilizable
│   │   ├── ConfirmDialog.tsx     # Diálogo de confirmación
│   │   ├── NotificationMenu.tsx  # Campana de notificaciones (solo presidente)
│   │   ├── RegistroVecinoForm.tsx   # Formulario crear vecino
│   │   ├── EditarVecinoForm.tsx     # Formulario editar vecino
│   │   └── pages/
│   │       ├── ListaVecinos.tsx        # Tabla de vecinos (1003L)
│   │       ├── Antecedentes_vecino.tsx # Perfil del vecino (872L)
│   │       ├── ListaSolicitudes.tsx    # Solicitudes de certificados (726L)
│   │       ├── Documentos.tsx          # Documentos por vecino (711L)
│   │       ├── Historial.tsx           # Auditoría (453L)
│   │       ├── SubirDocumento.tsx      # Subida de archivos (250L)
│   │       ├── StatCard.tsx            # Tarjeta de estadísticas reusable
│   │       └── NotFound.tsx            # Página 404
│   ├── constants/
│   │   └── calles.ts              # CALLES, RELACIONES_PROPIEDAD
│   ├── utils/
│   │   ├── rut.ts                # Formateo y validación de RUT chileno
│   │   ├── pdf.ts                # Descarga de PDFs
│   │   └── excel.ts              # Export Excel (ExcelJS lazy)
│   └── test/                     # Tests vitest (21)
│       ├── rut.test.ts           # 16 tests
│       ├── pdf.test.ts           # 3 tests
│       ├── excel.test.ts         # 2 tests
│       └── setup.ts
├── .env                          # Variables locales (no commiteado)
└── vite.config.ts                # Build config + vitest config
```

## Convenciones

### Cómo agregar una página

```tsx
// 1. Crear el componente en src/components/pages/
export default function MiPagina() { ... }

// 2. Agregar lazy import en App.tsx
const MiPagina = React.lazy(() => import("./components/pages/MiPagina"));

// 3. Agregar ruta dentro de <Suspense>
<Route path="/presidente/mi-ruta" element={<MiPagina />} />

// 4. Agregar enlace en Navbar.tsx
{ label: "Mi Página", path: "/presidente/mi-ruta", icon: <MiIcon /> }
```

### Llamadas a la API

Usar siempre la instancia `api` de `src/api.tsx`:

```tsx
import api from "../../api";

const response = await api.get("/lista-vecinos/");
const response = await api.post("/agregar-vecino/", data);
```

**Prohibido usar `fetch()` directamente.** Los interceptores de `api` agregan automáticamente el token JWT y manejan errores 401.

### Estado

No hay store global. El estado se maneja con `useState`/`useEffect` local. Hay un AuthContext listo para migrar en el futuro.

### Utilidades compartidas

| Utilidad | Uso |
|---|---|
| `rut.ts` | `formatearRutConPuntos(rut)`, `formatearRut(rut)`, `validarFormatoRut(rut)` |
| `pdf.ts` | `descargarPDF(blob, contentDisposition, defaultName?)` |
| `excel.ts` | `await exportarAExcel(data, sheetName, fileName)` — ExcelJS lazy |
| `constants/calles.ts` | `CALLES`, `RELACIONES_PROPIEDAD` |

### Autenticación

- Token JWT en `localStorage` con key `"access_token"`
- `authService.login()` lo guarda automáticamente
- `api.tsx` lo adjunta en cada request vía interceptor
- Roles: `"presidente"` y `"vecino"`. Rutas separadas en `App.tsx`

### MUI 7 Grid

MUI 7 usa Grid2 con API `size`:

```tsx
// ✅ Correcto (MUI 7)
<Grid size={{ xs: 12, md: 6 }}>...</Grid>
```

### Performance

- **6 páginas + NotFound con `React.lazy()` + `<Suspense>`**: bundle inicial **-62%** (1732→661 kB)
- **ExcelJS lazy**: solo se descarga al clickear "Exportar" (~937 kB)
- **MUI en chunk separado**: `vite.config.ts` con `manualChunks`

### Robustez

- **`ErrorBoundary.tsx`**: captura crashes de renderizado, permite recargar
- **`NotFound.tsx`**: página 404 para rutas inexistentes
- **Cero `fetch()` directo**: todo el HTTP pasa por `api.tsx`
- **Sin `role="checkbox"` falso**, sin index-as-key, `target="_blank"` seguro

## Comandos

```bash
npm run dev         # Servidor desarrollo (localhost:5173)
npm run build       # Build producción (tsc + vite)
npm test            # Tests (vitest run, 21 tests)
npm run test:watch  # Tests en watch mode
npm run lint        # ESLint
```
