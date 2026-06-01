// src/admin/lib/api.ts — Client HTTP pour l'admin CTD
// Toutes les requêtes passent par le proxy Vite → localhost:5015

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Injecter le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ctd_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rediriger vers /admin/login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ctd_admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default api;
