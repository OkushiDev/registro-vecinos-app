export interface Vecino {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  numero_socio: number;
  estado: number;
}

export interface Documento {
  id: number;
  vecino_id: number;
  tipo_documento: string;
  tipo_documento_value: string;
  nombre_archivo: string;
  descripcion: string;
  fecha_subida: string;
}

export type FiltroTipo =
  | "rut"
  | "nombres"
  | "apellido_paterno"
  | "apellido_materno"
  | "numero_socio";
