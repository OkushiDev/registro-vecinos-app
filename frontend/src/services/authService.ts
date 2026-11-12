import api from "../api";
import { clearSession } from "./session";

const TOKEN_KEY = "access_token";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  rol: string;
  user_id: number;
  vecino_id: number;
  nombre_completo: string;
}

export interface UserData {
  user_id: number;
  username: string;
  rol: string;
  vecino: {
    id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    rut: string;
    numero_socio: number;
    nombre_calle: string;
    numero_casa: string;
    relacion_propiedad: string;
    telefono: string;
    email: string;
    fecha_registro: string;
    estado: number;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await api.post<AuthResponse>("/api/token", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem("rol", response.data.rol);
      localStorage.setItem("user_id", response.data.user_id.toString());
      localStorage.setItem("vecino_id", response.data.vecino_id.toString());
      localStorage.setItem("nombre_completo", response.data.nombre_completo);
    }

    return response.data;
  }

  async getCurrentUser(): Promise<UserData> {
    const response = await api.get<UserData>("/api/me");
    return response.data;
  }

  logout(): void {
    clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem("rol");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isPresidente(): boolean {
    return this.getRol() === "presidente";
  }

  isVecino(): boolean {
    return this.getRol() === "vecino";
  }
}

export default new AuthService();
