export interface VecinoData {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  rut: string;
  numero_socio: number | null;
  nombre_calle: string | null;
  numero_casa: string | null;
  relacion_propiedad: string | null;
  telefono: string | null;
  email: string | null;
  fecha_registro: string;
  estado: number;
}

export interface DocumentoBackend {
  id: number;
  vecino_id: number;
  tipo_documento: string;
  tipo_documento_value: string;
  nombre_archivo: string;
  fecha_subida: string;
}

export interface ContactForm {
  telefono: string;
  email: string;
  currentPassword: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type FormErrors = { [key: string]: string };
