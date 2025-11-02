CREATE TABLE vecinos (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    rut VARCHAR(12) UNIQUE NOT NULL,
    numero_socio INTEGER,
    direccion VARCHAR(200) NOT NULL,
    fecha_registro DATE NOT NULL,
    fecha_edicion DATE,
    telefono VARCHAR(15),
    email VARCHAR(100)
);

INSERT INTO vecinos (nombres, apellido_paterno, apellido_materno, rut, numero_socio, direccion, fecha_registro, fecha_edicion, telefono, email) VALUES
('Marcela Julia', 'Bolados', ' ', '13532259-8', 1, 'Rio loco, 1628', '2004-10-21', '2004-10-21', '', ''),
('Juan Jose', 'Cornejo', 'O.', '13572049-6', 2, 'Rio loco, 1628', '2004-10-21', '2004-10-21', '', ''),
('Maria Angelica', 'Tapia', 'O.', '6017767-8', 3, 'Rio loco, 1652', '2004-10-21', '2004-10-21', '', ''),
('Jorge', 'Bolvaran', 'Flores', '5355693-0', 4, 'Rio loco, 1652', '2004-10-21', '2004-10-21', '', ''),
('Amelia', 'Donoso', 'Garcia', '5885048-9', 5, 'Rio loco, 1664', '2004-10-21', '2004-10-21', '', ''),
('Catherine', 'Recaros', 'Tapia', '13720991-8', 6, 'Rio loco, 1664', '2004-10-21', '2004-10-21', '', ''),
('Fernando', 'Caceres', 'Latorre', '13500597-9', 7, 'Rio loco, 1664', '2004-10-21', '2004-10-21', '', ''),
('Luis Alberto', 'Gonzalez', 'Orellana', '13745623-1', 8, 'Rio loco, 1676', '2004-10-21', '2004-10-21', '', ''),
('Hernan', 'Loza', 'Saavedra', '6356989-5', 9, 'Rio loco, 1676', '2004-10-21', '2004-10-21', '', ''),
('Elba', 'Camilo', 'Mauro', '6806031-1', 10, 'Rio loco, 1676', '2004-10-21', '2004-10-21', '', ''),
('Jose Luis', 'Benavides', 'Gonzalez', '14306046-2', 35, 'Leonardo da vinci, 2603', '2004-10-21', '2004-10-21', '', '');
