import axios from "axios";

// Peticiones al backend. Cada feature arma sus llamadas en su propio api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token venció o no es válido, el backend responde 401: se cierra la sesión.
// El login se excluye porque ahí un 401 significa usuario o contraseña incorrectos.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !esLogin && localStorage.getItem("token")) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
