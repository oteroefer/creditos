import api from "../../compartido/api";

// Endpoints de /users (backend/src/app/routers/users.py)
export async function registrarUsuario({ username, email, password, role }) {
  const { data } = await api.post("/users/", { username, email, password, role });
  return data;
}

// Endpoints de /auth (backend/src/app/routers/auth.py)
export async function iniciarSesion({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}
