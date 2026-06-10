# Frontend — Registro Vecinos App

React 19 + TypeScript + Vite + MUI 7. Gestionado con npm.

## Stack

- **Framework:** React 19 + TypeScript 5.9
- **Build:** Vite 7
- **UI:** MUI 7 (Material-UI) + Emotion
- **Routing:** react-router-dom 7
- **HTTP:** Axios
- **Excel:** ExcelJS (reemplazó a xlsx por vulnerabilidades)
- **Lint:** ESLint 9 + typescript-eslint

## Setup rápido

```bash
cd frontend
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
│   ├── App.tsx                   # Layout, routing, theme, auth state
│   ├── api.tsx                   # Instancia axios única (con interceptores)
│   ├── services/
│   │   └── authService.ts        # Login, logout, token management
│   ├── components/
│   │   ├── Navbar.tsx            # AppBar con navegación + theme toggle
│   │   ├── Login.tsx             # Pantalla de login
│   │   ├── Modal.tsx             # Modal genérico reutilizable
│   │   ├── ConfirmDialog.tsx     # Diálogo de confirmación
│   │   ├── NotificationMenu.tsx  # Campana de notificaciones (solo presidente)
│   │   ├── RegistroVecinoForm.tsx   # Formulario crear vecino
│   │   ├── EditarVecinoForm.tsx     # Formulario editar vecino
│   │   └── pages/
│   │       ├── ListaVecinos.tsx        # Tabla de vecinos con filtros
│   │       ├── ListaSolicitudes.tsx    # Solicitudes de certificados
│   │       ├── Documentos.tsx          # Documentos por vecino
│   │       ├── Historial.tsx           # Auditoría de acciones
│   │       ├── Antecedentes_vecino.tsx # Perfil del vecino (auto-servicio)
│   │       └── SubirDocumento.tsx      # Subida de archivos
│   └── utils/
│       ├── rut.ts                # Formateo y validación de RUT chileno
│       ├── pdf.ts                # Descarga de PDFs
│       └── excel.ts              # Exportación a Excel con ExcelJS
├── .env                          # Variables locales (no commiteado)
└── vite.config.ts                # Build con code-splitting (MUI + ExcelJS)
```

## Convenciones

### Cómo agregar una página

```tsx
// 1. Crear el componente en src/components/pages/
export default function MiPagina() { ... }

// 2. Agregar ruta en App.tsx
<Route path="/presidente/mi-ruta" element={<MiPagina />} />

// 3. Agregar enlace en Navbar.tsx
{
  label: "Mi Página",
  path: "/presidente/mi-ruta",
  icon: <MiIcon fontSize="small" />,
}
```

### Llamadas a la API

Usar siempre la instancia `api` de `src/api.tsx`:

```tsx
import api from "../../api";

const response = await api.get("/lista-vecinos/");
const response = await api.post("/agregar-vecino/", data);
```

No usar `fetch()` directamente. Los interceptores de `api` agregan automáticamente el token JWT.

### Estado global

No hay store (Redux/Zustand). El estado se maneja con:
- `useState` / `useReducer` local en cada componente
- `useEffect` para carga inicial y polling
- Eventos custom (`window.dispatchEvent`) para comunicación entre componentes (ej: notificaciones → lista solicitudes)

### Utilidades compartidas

Siempre que veas código duplicado (formateo de RUT, descarga de PDF, exportación Excel), moverlo a `src/utils/`. Actualmente existen:

| Utilidad | Uso |
|---|---|
| `rut.ts` | `formatearRutConPuntos(rut)`, `formatearRut(rut)`, `validarFormatoRut(rut)` |
| `pdf.ts` | `descargarPDF(blob, contentDisposition)` |
| `excel.ts` | `await exportarAExcel(data, sheetName, fileName)` |

### Autenticación

El token JWT se almacena en `localStorage` con key `"access_token"`.
`authService.login()` lo guarda automáticamente.
`api.tsx` lo lee en cada request vía interceptor.

Roles: `"presidente"` y `"vecino"`. El ruteo en `App.tsx` cambia según el rol.

### MUI 7 Grid

MUI 7 usa Grid2 con API `size` en vez de `item` + `xs/md`:

```tsx
// ✅ Correcto (MUI 7)
<Grid size={{ xs: 12, md: 6 }}>...</Grid>

// ❌ Incorrecto (MUI 5/6)
<Grid item xs={12} md={6}>...</Grid>
```

### Bundle

El build está configurado con code-splitting en `vite.config.ts`:

| Chunk | Contenido |
|---|---|
| `index.js` | App + react-router + axios |
| `mui.js` | MUI + Emotion |
| `excel.js` | ExcelJS |

## Build y lint

```bash
npm run build     # tsc + vite build
npm run lint      # ESLint
npm run dev       # Servidor de desarrollo
```
