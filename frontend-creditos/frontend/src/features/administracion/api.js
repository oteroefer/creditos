import api from "../../compartido/api";

// Endpoints de /users (backend/src/app/routers/users.py)
export async function listarUsuarios() {
  const { data } = await api.get("/users/");
  return data;
}

export async function asignarRol(userId, roleId) {
  const { data } = await api.patch(`/users/${userId}/role`, { role_id: roleId });
  return data;
}

// Endpoints de /roles (backend/src/app/routers/roles.py)
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
