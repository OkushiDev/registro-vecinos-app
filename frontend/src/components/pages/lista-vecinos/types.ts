export interface Column {
  id:
    | "id"
    | "nombres"
    | "apellido_paterno"
    | "apellido_materno"
    | "rut"
    | "numero_socio"
    | "nombre_calle"
    | "numero_casa"
    | "relacion_propiedad"
    | "fecha_registro"
    | "fecha_edicion"
    | "telefono"
    | "email"
    | "acciones_certificado"
    | "acciones_editar"
    | "acciones_estado";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
}

export interface Data {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  nombre_calle: string;
  numero_casa: string;
  relacion_propiedad: string;
  fecha_registro: string;
  fecha_edicion: string;
  telefono: string;
  email: string;
  estado: number;
}

export interface VecinoToToggle {
  id: number;
  nombre: string;
  estadoActual: number;
}
