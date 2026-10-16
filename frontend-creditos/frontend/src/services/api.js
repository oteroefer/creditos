import axios from "axios";

// Peticiones al backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

// Endpoints de /users (backend/src/app/routers/users.py)
export async function registrarUsuario({ username, email, password }) {
  const { data } = await api.post("/users/", { username, email, password });
  return data;
}

export async function listarUsuarios() {
  const { data } = await api.get("/users/");
  return data;
}

export async function asignarRol(userId, roleId) {
  const { data } = await api.patch(`/users/${userId}/role`, { role_id: roleId });
  return data;
}

// Endpoints de /auth (backend/src/app/routers/auth.py)

export async function iniciarSesion({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}

export async function listarRoles() {
  const { data } = await api.get("/roles/");
  return data;
}

export async function crearRol(name) {
  const { data } = await api.post("/roles/", { name });
  return data;
}

export async function actualizarRol(roleId, name) {
  const { data } = await api.patch(`/roles/${roleId}`, { name });
  return data;
}

export async function eliminarRol(roleId) {
  await api.delete(`/roles/${roleId}`);
}

export default api;
