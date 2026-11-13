import api from "../../compartido/api";

// Endpoints de /ventas (backend/src/app/ventas/router.py)
export async function listarVentas() {
  const { data } = await api.get("/ventas/");
  return data;
}

export async function registrarVenta(datos) {
  const { data } = await api.post("/ventas/", datos);
  return data;
}

// Compra a crédito que hace un cliente por su cuenta. datos: { producto_id, cuotas }.
// La tasa la fija el servidor.
export async function solicitarCompra(datos) {
  const { data } = await api.post("/ventas/solicitar", datos);
  return data;
}

// Endpoint de /simulacion (backend/src/app/simulacion/router.py)
// datos: { monto, tasa_anual, cuotas }. No guarda nada, solo calcula.
export async function simularCredito(datos) {
  const { data } = await api.post("/simulacion/", datos);
  return data;
}

// Clientes (solo rol cliente). Disponible para vendedor y admin.
export async function listarClientes() {
  const { data } = await api.get("/users/clientes");
  return data;
}

// Productos (para el panel del vendedor).
export async function listarProductos() {
  const { data } = await api.get("/productos/");
  return data;
}