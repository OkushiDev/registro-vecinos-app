import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR PARA AGREGAR EL TOKEN A TODAS LAS PETICIONES
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR PARA MANEJAR ERRORES DE RESPUESTA
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    // Manejo específico de errores de autenticación
    if (error.response?.status === 401) {
      console.error("Error 401: No autorizado - Token inválido o expirado");
      // Opcional: redirigir a login automáticamente
      // localStorage.removeItem("access_token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
