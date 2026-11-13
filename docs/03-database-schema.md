# Database Schema

PostgreSQL vía Docker. Inicializado con `database/scripts/init.sql`.

## Diagrama de Relaciones

```
┌───────────────────┐       ┌───────────────────┐
│     vecinos       │       │     usuarios      │
├───────────────────┤       ├───────────────────┤
│ id PK             │──┐    │ id PK             │
│ nombres           │  │    │ username UNIQUE    │
│ apellido_paterno  │  │    │ hashed_password    │
│ apellido_materno  │  │    │ vecino_id FK ──────┤── 1:1
│ rut UNIQUE        │  │    │ rol (default vecino)│
│ numero_socio UNIQUE│  │    │ estado (1 activo)  │
│ nombre_calle      │  │    │ fecha_creacion     │
│ numero_casa       │  │    └───────────────────┘
│ relacion_propiedad│  │
│ telefono          │  │    ┌───────────────────┐
│ email             │  │    │   documentos      │
│ fecha_registro    │  │    ├───────────────────┤
│ fecha_edicion     │  │    │ id PK             │
│ estado (1 activo) │──┤──>│ vecino_id FK       │
└───────────────────┘  │    │ tipo_documento    │
                       │    │ nombre_archivo    │
                       │    │ ruta_archivo      │
                       │    │ tipo_archivo      │
                       │    │ tamanio           │
                       │    │ descripcion       │
                       │    │ fecha_subida      │
                       │    │ estado            │
                       │    └───────────────────┘
                       │
                       │    ┌───────────────────┐
                       │    │   solicitudes     │
                       │    ├───────────────────┤
                       │    │ id PK             │
                       └──>│ vecino_id FK       │
                            │ tipo_solicitud    │
                            │ fecha_solicitud   │
                            │ estado            │
                            │ visibilidad       │
                            └───────────────────┘

┌───────────────────┐
│    historial      │
├───────────────────┤
│ id PK             │
│ usuario_id FK ────┤──> usuarios.id (nullable)
│ descripcion       │
│ tipo_accion       │
│ fecha_accion      │
└───────────────────┘
```

## Tablas

### vecinos
Almacena los residentes registrados.

| Columna | Tipo | Default | Notas |
|---------|------|---------|-------|
| id | SERIAL PK | | |
| nombres | VARCHAR(100) | NOT NULL | |
| apellido_paterno | VARCHAR(100) | NOT NULL | |
| apellido_materno | VARCHAR(100) | NULL | |
| rut | VARCHAR(12) | UNIQUE NOT NULL | Formato: `12345678-9` |
| numero_socio | INTEGER | UNIQUE | Número de socio correlativo |
| nombre_calle | VARCHAR(200) | NULL | |
| numero_casa | VARCHAR(20) | NULL | |
| relacion_propiedad | VARCHAR(50) | NULL | `Propietario`, `Arrendatario`, `Residente`, `Otro` |
| telefono | VARCHAR(15) | NULL | |
| email | VARCHAR(100) | NULL | |
| fecha_registro | TIMESTAMPTZ | `now()` | |
| fecha_edicion | TIMESTAMPTZ | `now()` | Se actualiza con `ON UPDATE` |
| estado | INTEGER | 1 | `1` activo, `0` inactivo |

### usuarios
Credenciales de acceso. Relación 1:1 con vecinos.

| Columna | Tipo | Default | Notas |
|---------|------|---------|-------|
| id | SERIAL PK | | |
| username | VARCHAR(50) | UNIQUE NOT NULL | Es el RUT del vecino |
| hashed_password | VARCHAR(255) | NOT NULL | Hash bcrypt |
| vecino_id | INTEGER FK | UNIQUE | References vecinos(id) |
| rol | VARCHAR(50) | `'vecino'` | `'presidente'` o `'vecino'` |
| estado | INTEGER | 1 | `1` activo, `0` inactivo |
| fecha_creacion | TIMESTAMPTZ | `now()` | |

### documentos
Archivos subidos por los vecinos.

| Columna | Tipo | Default | Notas |
|---------|------|---------|-------|
| id | SERIAL PK | | |
| vecino_id | INTEGER FK | NOT NULL | References vecinos(id) |
| tipo_documento | VARCHAR(255) | NULL | Ver tipos en API reference |
| nombre_archivo | VARCHAR(255) | NOT NULL | |
| ruta_archivo | VARCHAR(500) | NOT NULL | Ruta física en `uploads/` |
| tipo_archivo | VARCHAR(50) | NULL | MIME type |
| tamanio | INTEGER | NULL | En bytes |
| descripcion | VARCHAR(500) | NULL | |
| fecha_subida | TIMESTAMPTZ | `now()` | |
| estado | INTEGER | 1 | |

### solicitudes
Solicitudes de certificados de residencia.

| Columna | Tipo | Default | Notas |
|---------|------|---------|-------|
| id | SERIAL PK | | |
| vecino_id | INTEGER FK | NOT NULL | References vecinos(id) |
| tipo_solicitud | VARCHAR(100) | `'certificado_residencia'` | |
| fecha_solicitud | TIMESTAMPTZ | `now()` | |
| estado | VARCHAR(50) | `'pendiente'` | `pendiente`, `aprobada`, `rechazada` |
| visibilidad | VARCHAR(50) | `'mostrar'` | `mostrar`, `ocultar` |

### historial
Log de auditoría de acciones.

| Columna | Tipo | Default | Notas |
|---------|------|---------|-------|
| id | SERIAL PK | | |
| usuario_id | INTEGER FK | NULL | References usuarios(id). NULL para acciones del sistema |
| descripcion | TEXT | NULL | Descripción de la acción |
| tipo_accion | VARCHAR(100) | NULL | `Login`, `Creacion`, `EDICION`, `Estado`, `DOCUMENTO`, `SOLICITUD`, `CERTIFICADO` |
| fecha_accion | TIMESTAMPTZ | `now()` | |

## Seed Data

El archivo `database/scripts/init.sql` contiene:

- **35 vecinos** de prueba con nombres, RUTs, direcciones (calles temáticas: Rio Loco, Galileo Galilei, Tiziano, etc.) y números de socio correlativos del 1 al 35.
- **35 usuarios** vinculados 1:1. Username = RUT del vecino.
- **Contraseñas**: Formato `ApellidoPaterno + primeros 4 dígitos del RUT` (ej: `Bolados1353`), hasheadas con `pgcrypto` al insertarse.
- **Presidente**: El vecino #35 (José Luis Benavides, RUT `14306046-2`) tiene rol `presidente`. Los demás son `vecino`.

## Tipos de Acción (Historial)

| Tipo | Cuándo se usa |
|------|---------------|
| `Login` | Inicio de sesión exitoso |
| `Creacion` | Registro de nuevo vecino |
| `EDICION` | Actualización de datos de vecino |
| `Estado` | Habilitar/deshabilitar vecino |
| `DOCUMENTO` | Subida/eliminación de documento |
| `SOLICITUD` | Creación/cambio de estado de solicitud |
| `CERTIFICADO` | Generación de certificado PDF |
