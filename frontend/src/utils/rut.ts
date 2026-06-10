/**
 * Limpia un RUT: elimina puntos y guión.
 * Ej: "12.345.678-9" -> "123456789"
 */
export const limpiarRut = (rut: string): string => {
  return rut.replace(/\./g, "").replace(/-/g, "").trim();
};

/**
 * Formatea un RUT sin procesar agregando guión (sin puntos).
 * Ej: "123456789" -> "12345678-9"
 */
export const formatearRut = (rut: string): string => {
  const rutLimpio = limpiarRut(rut);
  if (!rutLimpio) return "";
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  if (cuerpo.length < 7 || cuerpo.length > 8) return rut;
  return `${cuerpo}-${dv}`;
};

/**
 * Formatea un RUT con puntos y guión para mostrar.
 * Ej: "12345678-9" -> "12.345.678-9"
 */
export const formatearRutConPuntos = (rut: string): string => {
  if (!rut) return "-";
  const rutLimpio = limpiarRut(rut);
  if (rutLimpio.length < 2) return rut;
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
};

/**
 * Valida el formato básico de un RUT chileno.
 */
export const validarFormatoRut = (rut: string): boolean => {
  const rutLimpio = limpiarRut(rut);
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
  const cuerpo = rutLimpio.slice(0, -1);
  if (!/^\d+$/.test(cuerpo)) return false;
  const dv = rutLimpio.slice(-1).toUpperCase();
  return /^[\dK]$/.test(dv);
};
