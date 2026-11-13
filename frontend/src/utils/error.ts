const getDetail = (error: unknown): unknown => {
  return (error as { response?: { data?: { detail?: unknown } } } | null)
    ?.response?.data?.detail;
};

export const getErrorDetail = (error: unknown): string | undefined => {
  const detail = getDetail(error);
  return typeof detail === "string" ? detail : undefined;
};

export const getErrorMessage = (error: unknown): string => {
  if (!error) return "Error desconocido";

  const detail = getDetail(error);
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const entry = item as { loc?: unknown[]; msg?: string };
        return String(entry.loc?.[1] ?? entry.msg ?? "");
      })
      .join(", ");
  }
  if (typeof detail === "string") return detail;

  if (error instanceof TypeError) {
    return "No se pudo conectar con el servidor. Verifique su conexión.";
  }

  const err = error as { response?: { status?: number }; message?: string };
  if (err.response?.status === 401) return "Sesión expirada. Inicie sesión nuevamente.";
  if (err.response?.status === 403) return "No tienes permisos para realizar esta acción.";
  if (err.message) return err.message;
  return "Error desconocido.";
};
