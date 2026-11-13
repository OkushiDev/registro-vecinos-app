/* eslint-disable @typescript-eslint/no-explicit-any -- respuestas dinámicas sin contrato compartido */

import { clearSession } from "./services/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiError extends Error {
  response?: { data: { detail?: string }; status: number };
  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.response = status ? { data: { detail }, status } : undefined;
  }
}

function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  return `${url}?${qs.toString()}`;
}

function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((v, k) => { obj[k] = v; });
  return obj;
}

async function request<T = any>(url: string, options: RequestInit & { responseType?: string; params?: Record<string, any>; skipAuthRedirect?: boolean } = {}): Promise<{ data: T; headers: Record<string, string>; status: number }> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body instanceof FormData) {
    // El navegador genera el boundary; fijarlo a mano rompe el multipart.
    delete headers["Content-Type"];
  } else {
    headers["Content-Type"] = "application/json";
  }

  const { responseType, params, skipAuthRedirect, ...fetchOptions } = options;
  const fullUrl = buildUrl(`${API_URL}${url}`, params);
  const res = await fetch(fullUrl, { ...fetchOptions, headers });

  const status = res.status;

  // Token inválido o expirado: limpiar sesión y volver al login.
  // El login y las consultas de fondo (skipAuthRedirect) quedan excluidos.
  if (status === 401 && !skipAuthRedirect && !url.includes("/api/token")) {
    clearSession();
    window.location.reload();
    throw new ApiError("Sesión expirada", 401);
  }

  const resHeaders = headersToObject(res.headers);

  if (responseType === "blob") {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(res.statusText, status, errData.detail);
    }
    return { data: (await res.blob()) as T, headers: resHeaders, status };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.statusText, status, data.detail);
  return { data, headers: resHeaders, status };
}

const api = {
  get: <T = any>(url: string, config?: { responseType?: string; params?: Record<string, any>; skipAuthRedirect?: boolean }) =>
    request<T>(url, { method: "GET", ...config }),
  post: <T = any>(url: string, body?: any, config?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
    request<T>(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), ...config }),
  put: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(url: string) => request<T>(url, { method: "DELETE" }),
};

export default api;
