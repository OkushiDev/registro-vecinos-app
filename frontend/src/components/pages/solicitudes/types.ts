export interface Data {
  id: number;
  nombre_completo: string;
  rut: string;
  numero_socio: number;
  tipo_solicitud: string;
  fecha_solicitud: string;
  fecha_solicitud_formato: string;
  estado: string;
  visibilidad: string;
  vecino_id: number;
}

export type Order = "asc" | "desc";
