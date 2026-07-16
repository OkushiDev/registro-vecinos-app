CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE vecinos (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    rut VARCHAR(12) UNIQUE NOT NULL,
    numero_socio INTEGER UNIQUE,
    nombre_calle VARCHAR(200),
    numero_casa VARCHAR(20),
    relacion_propiedad VARCHAR(50),
    telefono VARCHAR(15),
    email VARCHAR(100),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_edicion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado INTEGER DEFAULT 1
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    vecino_id INTEGER UNIQUE REFERENCES vecinos(id),
    rol VARCHAR(50) DEFAULT 'vecino',
    estado INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    vecino_id INT NOT NULL REFERENCES vecinos(id),
    tipo_documento VARCHAR(255),
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(50),
    tamanio INT,
    descripcion VARCHAR(500),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado INT DEFAULT 1
);

CREATE TABLE historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    descripcion TEXT,
    tipo_accion VARCHAR(100),
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    vecino_id INTEGER NOT NULL REFERENCES vecinos(id),
    tipo_solicitud VARCHAR(100) NOT NULL DEFAULT 'certificado_residencia',
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'pendiente',
    visibilidad VARCHAR(50) DEFAULT 'mostrar'
);

INSERT INTO vecinos (nombres, apellido_paterno, apellido_materno, rut, numero_socio, nombre_calle, numero_casa, relacion_propiedad, fecha_registro, fecha_edicion, telefono, email, estado) VALUES
('Maria Angelica', 'Tapia', 'O.', '6017767-8', 3, 'Galileo Galilei', '1852', 'Propietario', '2004-10-21', '2004-10-21', '956123478', 'maria.tapia@yahoo.com', 1),
('Jose Luis', 'Benavides', 'Gonzalez', '14306046-2', 35, 'Leonardo da Vinci', '2603', 'Propietario', '2004-10-21', '2004-10-21', '991234567', 'jose.benavide@yahoo.com', 1);

INSERT INTO usuarios (vecino_id, username, hashed_password, rol) VALUES
(1, '6017767-8', crypt('Tapia6017', gen_salt('bf', 8)), 'vecino'),
(2, '14306046-2', crypt('Benavides1430', gen_salt('bf', 8)), 'presidente');

