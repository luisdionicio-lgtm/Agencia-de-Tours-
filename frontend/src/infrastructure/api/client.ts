import axios from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  timeout: 12_000,
  headers: { Accept: "application/json" }
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
