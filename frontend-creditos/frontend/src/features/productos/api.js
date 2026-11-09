import api from "../../compartido/api";

// Endpoints de /productos (backend/src/app/productos/router.py)
export async function listarProductos(incluirInactivos = false) {
  const { data } = await api.get("/productos/", {
    params: incluirInactivos ? { incluir_inactivos: true } : {},
  });
  return data;
}

export async function obtenerProducto(productoId) {
  const { data } = await api.get(`/productos/${productoId}`);
  return data;
}

export async function crearProducto(producto) {
  const { data } = await api.post("/productos/", producto);
  return data;
}

export async function actualizarProducto(productoId, cambios) {
  const { data } = await api.patch(`/productos/${productoId}`, cambios);
  return data;
}

export async function darDeBajaProducto(productoId) {
  await api.delete(`/productos/${productoId}`);
}
