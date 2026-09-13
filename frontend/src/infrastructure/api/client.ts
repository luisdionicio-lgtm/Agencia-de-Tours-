import axios from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  timeout: 12_000,
  headers: { Accept: "application/json" }
});

api.interceptors.response.use((response) => response, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.headers.Authorization && typeof window !== "undefined") {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffRole");
    window.dispatchEvent(new Event("john-session-expired"));
  }
  return Promise.reject(error);
});

api.interceptors.request.use((config) => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_API_URL) {
    throw new axios.AxiosError("Servicio no configurado para operaciones reales", "ERR_SERVICE_UNAVAILABLE");
  }
  const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;
  if (token && !token.startsWith("demo-")) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
