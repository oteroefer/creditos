import api from "../../compartido/api";

// Endpoints de /users (backend/src/app/usuarios/router.py). Toda cuenta nueva queda como cliente.
export async function registrarUsuario({ username, email, password }) {
  const { data } = await api.post("/users/", { username, email, password });
  return data;
}

// Endpoints de /auth (backend/src/app/auth/router.py)
export async function iniciarSesion({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}
