# API Reference — Registro Vecinos

Base URL: `http://localhost:8000`

## Autenticación

### `POST /api/token`
Login. Retorna JWT + datos del usuario.

**Request:** `application/x-www-form-urlencoded`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `username` | string | RUT del vecino (ej: `12345678-9`) |
| `password` | string | Contraseña |

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "rol": "presidente|vecino",
  "user_id": 1,
  "vecino_id": 1,
  "nombre_completo": "Juan Perez"
}
```

**Errores:** `401` credenciales inválidas, `403` usuario deshabilitado.

---

### `GET /api/me`
Perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user_id": 1,
  "username": "12345678-9",
  "rol": "vecino",
  "vecino": {
    "id": 1, "nombres": "Juan", "apellido_paterno": "Perez",
    "apellido_materno": "Garcia", "rut": "12345678-9",
    "numero_socio": 5, "nombre_calle": "Los Olivos",
    "numero_casa": "123", "relacion_propiedad": "Propietario",
    "telefono": "912345678", "email": "juan@email.com",
    "fecha_registro": "2024-01-01", "estado": 1
  }
}
```

---

## Vecinos

### `GET /lista-vecinos/`
Lista todos los vecinos (sin autenticación).

**Response (200):** `{ "vecinos": [ { id, nombres, rut, ... }, ... ] }`

---

### `GET /vecino/{id}`
Obtiene un vecino por ID.

---

### `POST /agregar-vecino/`
Crea un vecino + su usuario automáticamente.

**Auth:** Requiere token (presidente)

**Request body:**
```json
{
  "nombres": "Juan",
  "apellido_paterno": "Perez",
  "apellido_materno": "Garcia",
  "rut": "12345678-9",
  "numero_socio": 36,
  "nombre_calle": "Los Olivos",
  "numero_casa": "123",
  "relacion_propiedad": "Propietario",
  "telefono": "912345678",
  "email": "juan@email.com"
}
```

**Response (200):** Vecino creado + username + password inicial.

---

### `PUT /editar-vecino/{id}`
Actualiza datos del vecino. Opcionalmente cambia contraseña.

**Auth:** Requiere token

Si se envía `currentPassword`, se valida contra el hash almacenado. Si además se envía `newPassword`, se actualiza.

---

### `PATCH /cambiar-estado-vecino/{id}`
Toggle activo/inactivo del vecino (y su usuario asociado).

**Auth:** Requiere token

**Response:** `{ "message": "...", "nuevo_estado": 0|1 }`

---

### `GET /siguiente-numero-socio/`
Obtiene el próximo número de socio disponible.

**Response:** `{ "siguiente_numero_socio": 36 }`

---

## Documentos

### `GET /api/documentos/tipos`
Lista tipos de documentos disponibles.

**Response:**
```json
{
  "tipos": [
    { "value": "cedula_identidad", "label": "Cédula de Identidad" },
    { "value": "registro_social_hogares", "label": "Registro Social de Hogares" },
    { "value": "avaluo_fiscal", "label": "Avalúo Fiscal" },
    { "value": "boleta_agua", "label": "Boleta de Agua" },
    { "value": "boleta_luz", "label": "Boleta de Luz" },
    { "value": "escritura_casa", "label": "Escritura de Casa" }
  ]
}
```

---

### `POST /api/documentos/subir`
Sube un archivo para el vecino autenticado.

**Auth:** Requiere token

**Request:** `multipart/form-data`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `file` | file | PDF, PNG, JPG (max 5MB) |
| `tipo_documento` | string | Uno de los tipos anteriores |
| `descripcion` | string | Opcional |

---

### `GET /api/documentos/vecino/{vecino_id}`
Lista documentos de un vecino.

**Auth:** Requiere token. Presidente puede ver todos; vecino solo los suyos.

---

### `GET /api/documentos/descargar/{documento_id}`
Descarga un archivo.

**Auth:** Requiere token. Mismas restricciones de visibilidad.

---

## Solicitudes

### `GET /api/solicitudes`
Lista todas las solicitudes (solo presidente).

**Auth:** Requiere token (presidente)

---

### `POST /api/solicitudes/crear`
Crea una solicitud de certificado para el vecino autenticado.

**Auth:** Requiere token

**Request body:** `{ "tipo_solicitud": "certificado_residencia" }`

---

### `PATCH /api/solicitudes/{id}/estado`
Actualiza el estado de una solicitud.

**Auth:** Requiere token (presidente)

**Request body:** `{ "estado": "aprobada|rechazada" }`

---

## Historial / Auditoría

### `GET /historial/`
Lista todo el historial de acciones (orden descendente).

**Response:** Array de `{ id, descripcion_accion, tipo_accion, fecha_accion, usuario }`

---

### `POST /historial/`
Crea un registro en el historial.

**Auth:** Requiere token

---

## Certificados

### `GET /api/generar-certificado/{vecino_id}`
Genera y descarga un PDF de certificado de residencia.

**Sin autenticación.** Usa plantilla PDF + superposición de datos con ReportLab.

**Response:** `application/pdf` con `Content-Disposition: attachment`.

---

## Convenciones

| Aspecto | Regla |
|---------|-------|
| Auth | `Authorization: Bearer <token>` |
| Errores | `{ "detail": "mensaje" }` con código HTTP |
| Fechas | ISO 8601 en BD, formato `dd-mm-YYYY` en respuestas de listado |
| Archivos | Máximo 5MB, solo PDF/PNG/JPG |
| CORS | `localhost:3000` y `localhost:5173` |
| Token expiry | 480 minutos (8 horas) |

## Endpoints sin autenticación

Estos endpoints NO requieren token (considerar para V2):

| Endpoint | Riesgo |
|----------|--------|
| `GET /lista-vecinos/` | Expone datos personales de todos los vecinos |
| `GET /vecino/{id}` | Expone datos de un vecino específico |
| `GET /siguiente-numero-socio/` | Bajo (solo un número) |
| `GET /api/generar-certificado/{id}` | Permite generar certificados sin autenticación |
| `GET /historial/` | Expone auditoría completa |
