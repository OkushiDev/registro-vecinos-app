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
    vecino_id INTEGER REFERENCES vecinos(id),
    tipo_documento VARCHAR(100),
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    descripcion TEXT,
    tipo_accion VARCHAR(100),
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO vecinos (nombres, apellido_paterno, apellido_materno, rut, numero_socio, nombre_calle, numero_casa, relacion_propiedad, fecha_registro, fecha_edicion, telefono, email, estado) VALUES
('Marcela Julia', 'Bolados', ' ', '13532259-8', 1, 'Rio loco', '1628', 'Propietario', '2004-10-21', '2004-10-21', '987654321', 'marcela.bolados@gmail.com', 0),
('Juan Jose', 'Cornejo', 'O.', '13572049-6', 2, 'Rio loco', '1628', 'Arrendatario', '2004-10-21', '2004-10-21', '998765432', 'juan.cornejo@outlook.com', 0),
('Maria Angelica', 'Tapia', 'O.', '6017767-8', 3, 'Galileo Galilei', '1852', 'Propietario', '2004-10-21', '2004-10-21', '956123478', 'maria.tapia@yahoo.com', 1),
('Jorge', 'Bolvaran', 'Flores', '5355693-0', 4, 'Giovanni Boccaccio', '2145', 'Propietario', '2004-10-21', '2004-10-21', '945678912', 'jorge.flores@gmail.com', 1),
('Amelia', 'Donoso', 'Garcia', '5885048-9', 5, 'Lourdes', '1789', 'Residente', '2004-10-21', '2004-10-21', '932456789', 'amelia.donoso@outlook.com', 1),
('Catherine', 'Recaros', 'Tapia', '13720991-8', 6, 'Tiziano', '2234', 'Propietario', '2004-10-21', '2004-10-21', '923456781', 'catherine.tapia@gmail.com', 1),
('Fernando', 'Caceres', 'Latorre', '13500597-9', 7, 'Boticelli', '1965', 'Arrendatario', '2004-10-21', '2004-10-21', '912345678', 'fernando.latorre@yahoo.com', 1),
('Luis Alberto', 'Gonzalez', 'Orellana', '13745623-1', 8, 'Miguel Angel', '2456', 'Propietario', '2004-10-21', '2004-10-21', '967891234', 'luis.gonzalez@gmail.com', 1),
('Hernan', 'Loza', 'Saavedra', '6356989-5', 9, 'Leonardo da Vinci', '2087', 'Residente', '2004-10-21', '2004-10-21', '978912345', 'hernan.saavedra@outlook.com', 1),
('Elba', 'Camilo', 'Mauro', '6806031-1', 10, 'Galileo Galilei', '1723', 'Otro', '2004-10-21', '2004-10-21', '989123456', 'elba.mauro@gmail.com', 1),
('Pedro', 'Silva', 'Morales', '12345678-9', 11, 'Rio loco', '1745', 'Propietario', '2004-10-21', '2004-10-21', '965432187', 'pedro.silva@gmail.com', 1),
('Carmen', 'Rojas', 'Vasquez', '11234567-8', 12, 'Galileo Galilei', '1920', 'Arrendatario', '2004-10-21', '2004-10-21', '976543218', 'carmen.vasquez@outlook.com', 1),
('Ricardo', 'Fernandez', 'Lopez', '10123456-7', 13, 'Giovanni Boccaccio', '2310', 'Propietario', '2004-10-21', '2004-10-21', '987654329', 'ricardo.lopez@yahoo.com', 1),
('Patricia', 'Munoz', 'Ramirez', '9012345-6', 14, 'Lourdes', '1855', 'Residente', '2004-10-21', '2004-10-21', '998765430', 'patricia.munoz@gmail.com', 1),
('Andres', 'Torres', 'Castro', '8901234-5', 15, 'Tiziano', '2115', 'Propietario', '2004-10-21', '2004-10-21', '956789123', 'andres.castro@outlook.com', 1),
('Monica', 'Vargas', 'Perez', '7890123-4', 16, 'Boticelli', '2045', 'Arrendatario', '2004-10-21', '2004-10-21', '945678923', 'monica.vargas@yahoo.com', 1),
('Rodrigo', 'Herrera', 'Medina', '6789012-3', 17, 'Miguel Angel', '2520', 'Propietario', '2004-10-21', '2004-10-21', '934567892', 'rodrigo.medina@gmail.com', 1),
('Valentina', 'Soto', 'Nunez', '5678901-2', 18, 'Leonardo da Vinci', '1998', 'Residente', '2004-10-21', '2004-10-21', '923456782', 'valentina.soto@outlook.com', 1),
('Felipe', 'Contreras', 'Fuentes', '4567890-1', 19, 'Galileo Galilei', '2178', 'Otro', '2004-10-21', '2004-10-21', '912345679', 'felipe.contreras@gmail.com', 1),
('Daniela', 'Parra', 'Guzman', '15678901-k', 20, 'Rio loco', '1812', 'Propietario', '2004-10-21', '2004-10-21', '967890124', 'daniela.guzman@yahoo.com', 1),
('Mauricio', 'Espinoza', 'Araya', '14567890-9', 21, 'Giovanni Boccaccio', '2267', 'Arrendatario', '2004-10-21', '2004-10-21', '978901235', 'mauricio.espinoza@gmail.com', 1),
('Lorena', 'Nunez', 'Bravo', '13456789-8', 22, 'Lourdes', '1934', 'Propietario', '2004-10-21', '2004-10-21', '989012346', 'lorena.bravo@outlook.com', 1),
('Cristian', 'Vega', 'Sandoval', '12345679-7', 23, 'Tiziano', '2389', 'Residente', '2004-10-21', '2004-10-21', '990123457', 'cristian.vega@yahoo.com', 1),
('Francisca', 'Molina', 'Diaz', '11234568-6', 24, 'Boticelli', '2156', 'Propietario', '2004-10-21', '2004-10-21', '965432198', 'francisca.molina@gmail.com', 1),
('Sebastian', 'Reyes', 'Carrasco', '10123457-5', 25, 'Miguel Angel', '2612', 'Arrendatario', '2004-10-21', '2004-10-21', '976543219', 'sebastian.reyes@outlook.com', 1),
('Camila', 'Ortiz', 'Vera', '9012346-4', 26, 'Leonardo da Vinci', '1876', 'Propietario', '2004-10-21', '2004-10-21', '987654320', 'camila.vera@gmail.com', 1),
('Diego', 'Jara', 'Henriquez', '8901235-3', 27, 'Galileo Galilei', '2423', 'Residente', '2004-10-21', '2004-10-21', '998765431', 'diego.jara@yahoo.com', 1),
('Javiera', 'Bustamante', 'Alarcon', '7890124-2', 28, 'Rio loco', '1705', 'Otro', '2004-10-21', '2004-10-21', '956789124', 'javiera.alarcon@outlook.com', 1),
('Gonzalo', 'Acuna', 'Pino', '6789013-1', 29, 'Giovanni Boccaccio', '2034', 'Propietario', '2004-10-21', '2004-10-21', '945678924', 'gonzalo.acuna@gmail.com', 1),
('Isidora', 'Castillo', 'Roman', '5678902-0', 30, 'Lourdes', '2545', 'Arrendatario', '2004-10-21', '2004-10-21', '934567893', 'isidora.roman@yahoo.com', 1),
('Nicolas', 'Guerrero', 'Valenzuela', '16789012-4', 31, 'Tiziano', '1823', 'Propietario', '2004-10-21', '2004-10-21', '923456783', 'nicolas.guerrero@gmail.com', 1),
('Sofia', 'Mendoza', 'Sepulveda', '15567890-2', 32, 'Boticelli', '2198', 'Residente', '2004-10-21', '2004-10-21', '912345670', 'sofia.sepulveda@outlook.com', 1),
('Matias', 'Flores', 'Campos', '14456789-1', 33, 'Miguel Angel', '2340', 'Propietario', '2004-10-21', '2004-10-21', '967890125', 'matias.campos@yahoo.com', 1),
('Antonella', 'Lagos', 'Rios', '13345678-k', 34, 'Leonardo da Vinci', '2467', 'Otro', '2004-10-21', '2004-10-21', '978901236', 'antonella.lagos@gmail.com', 1),
('Jose Luis', 'Benavides', 'Gonzalez', '14306046-2', 35, 'Leonardo da Vinci', '2603', 'Propietario', '2004-10-21', '2004-10-21', '991234567', 'jose.benavide@yahoo.com', 1);

INSERT INTO usuarios (vecino_id, username, hashed_password, rol) VALUES
(1, '13532259-8', crypt('Bolados1353', gen_salt('bf', 8)), 'vecino'),
(2, '13572049-6', crypt('Cornejo1357', gen_salt('bf', 8)), 'vecino'),
(3, '6017767-8', crypt('Tapia6017', gen_salt('bf', 8)), 'vecino'),
(4, '5355693-0', crypt('Bolvaran5355', gen_salt('bf', 8)), 'vecino'),
(5, '5885048-9', crypt('Donoso5885', gen_salt('bf', 8)), 'vecino'),
(6, '13720991-8', crypt('Recaros1372', gen_salt('bf', 8)), 'vecino'),
(7, '13500597-9', crypt('Caceres1350', gen_salt('bf', 8)), 'vecino'),
(8, '13745623-1', crypt('Gonzalez1374', gen_salt('bf', 8)), 'vecino'),
(9, '6356989-5', crypt('Loza6356', gen_salt('bf', 8)), 'vecino'),
(10, '6806031-1', crypt('Camilo6806', gen_salt('bf', 8)), 'vecino'),
(11, '12345678-9', crypt('Silva1234', gen_salt('bf', 8)), 'vecino'),
(12, '11234567-8', crypt('Rojas1123', gen_salt('bf', 8)), 'vecino'),
(13, '10123456-7', crypt('Fernandez1012', gen_salt('bf', 8)), 'vecino'),
(14, '9012345-6', crypt('Munoz9012', gen_salt('bf', 8)), 'vecino'),
(15, '8901234-5', crypt('Torres8901', gen_salt('bf', 8)), 'vecino'),
(16, '7890123-4', crypt('Vargas7890', gen_salt('bf', 8)), 'vecino'),
(17, '6789012-3', crypt('Herrera6789', gen_salt('bf', 8)), 'vecino'),
(18, '5678901-2', crypt('Soto5678', gen_salt('bf', 8)), 'vecino'),
(19, '4567890-1', crypt('Contreras4567', gen_salt('bf', 8)), 'vecino'),
(20, '15678901-k', crypt('Parra1567', gen_salt('bf', 8)), 'vecino'),
(21, '14567890-9', crypt('Espinoza1456', gen_salt('bf', 8)), 'vecino'),
(22, '13456789-8', crypt('Nunez1345', gen_salt('bf', 8)), 'vecino'),
(23, '12345679-7', crypt('Vega1234', gen_salt('bf', 8)), 'vecino'),
(24, '11234568-6', crypt('Molina1123', gen_salt('bf', 8)), 'vecino'),
(25, '10123457-5', crypt('Reyes1012', gen_salt('bf', 8)), 'vecino'),
(26, '9012346-4', crypt('Ortiz9012', gen_salt('bf', 8)), 'vecino'),
(27, '8901235-3', crypt('Jara8901', gen_salt('bf', 8)), 'vecino'),
(28, '7890124-2', crypt('Bustamante7890', gen_salt('bf', 8)), 'vecino'),
(29, '6789013-1', crypt('Acuna6789', gen_salt('bf', 8)), 'vecino'),
(30, '5678902-0', crypt('Castillo5678', gen_salt('bf', 8)), 'vecino'),
(31, '16789012-4', crypt('Guerrero1678', gen_salt('bf', 8)), 'vecino'),
(32, '15567890-2', crypt('Mendoza1556', gen_salt('bf', 8)), 'vecino'),
(33, '14456789-1', crypt('Flores1445', gen_salt('bf', 8)), 'vecino'),
(34, '13345678-k', crypt('Lagos1334', gen_salt('bf', 8)), 'vecino'),
(35, '14306046-2', crypt('Benavides1430', gen_salt('bf', 8)), 'presidente');



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
