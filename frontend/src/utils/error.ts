export const getErrorMessage = (error: any): string => {
  if (!error) return "Error desconocido";
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.detail && Array.isArray(data.detail)) {
      return data.detail.map((e: any) => e.loc?.[1] || e.msg).join(", ");
    }
    if (typeof data.detail === "string") return data.detail;
  }
  if (error.response?.status === 401) return "RUT o contraseña incorrectos.";
  if (error.response?.status === 403) return "Usuario deshabilitado o sin permisos.";
  if (error.message) return error.message;
  return "Error de conexión. Intente nuevamente.";
};
