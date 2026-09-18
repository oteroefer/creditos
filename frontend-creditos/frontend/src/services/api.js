import axios from "axios";

// Peticiones al backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints de /users (backend/src/app/routers/users.py)
export async function registrarUsuario({ username, email, password }) {
  const { data } = await api.post("/users/", { username, email, password });
  return data;
}

// Endpoints de /auth (backend/src/app/routers/auth.py)

export async function iniciarSesion({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}

export default api;
