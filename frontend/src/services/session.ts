const SESSION_KEYS = [
  "access_token",
  "rol",
  "user_id",
  "vecino_id",
  "nombre_completo",
  "usuario",
];

export const clearSession = (): void => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};
