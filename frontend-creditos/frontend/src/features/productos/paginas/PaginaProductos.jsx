import { useEffect, useState } from "react";
import { useAuth } from "../../sesion/AuthContext";
import {
  actualizarProducto,
  crearProducto,
  darDeBajaProducto,
  listarProductos,
} from "../api";
import FormProducto from "../componentes/FormProducto";
import TablaProductos from "../componentes/TablaProductos";

const FORM_VACIO = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "0",
  imagen_url: "",
};

// Arma el cuerpo que espera el backend a partir de los valores del formulario (que son texto).
function aDatosProducto(valores) {
  return {
    codigo: valores.codigo,
    nombre: valores.nombre,
    descripcion: valores.descripcion.trim() || null,
    precio: Number(valores.precio),
    stock: Number(valores.stock),
    imagen_url: valores.imagen_url.trim() || null,
  };
}

// Los errores 422 de FastAPI traen una lista en detail; el resto, un texto.
function mensajeDeError(err, porDefecto) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) return "Revisa los datos ingresados.";
  return detail || porDefecto;
}

export default function PaginaProductos() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.role === "admin";

  const [productos, setProductos] = useState([]);
  const [verInactivos, setVerInactivos] = useState(false);
  const [valores, setValores] = useState(FORM_VACIO);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarProductos() {
    setProductos(await listarProductos(verInactivos));
  }

  useEffect(() => {
    cargarProductos().catch(() => setError("No se pudieron cargar los productos."));
  }, [verInactivos]);

  function limpiarAvisos() {
    setError("");
    setMensaje("");
  }

  function cancelarEdicion() {
    setProductoEditandoId(null);
    setValores(FORM_VACIO);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    limpiarAvisos();
    try {
      if (productoEditandoId) {
        await actualizarProducto(productoEditandoId, aDatosProducto(valores));
        setMensaje("Producto modificado.");
      } else {
        await crearProducto(aDatosProducto(valores));
        setMensaje("Producto creado.");
      }
      cancelarEdicion();
      await cargarProductos();
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo guardar el producto."));
    }
  }

  function handleEdit(producto) {
    limpiarAvisos();
    setProductoEditandoId(producto.id);
    setValores({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precio: String(producto.precio),
      stock: String(producto.stock),
      imagen_url: producto.imagen_url ?? "",
    });
  }

  async function handleBaja(producto) {
    if (!window.confirm(`¿Seguro que quieres dar de baja "${producto.nombre}"?`)) {
      return;
    }
    limpiarAvisos();
    try {
      await darDeBajaProducto(producto.id);
      await cargarProductos();
      setMensaje("Producto dado de baja.");
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo dar de baja el producto."));
    }
  }

  async function handleReactivar(producto) {
    limpiarAvisos();
    try {
      await actualizarProducto(producto.id, { activo: true });
      await cargarProductos();
      setMensaje("Producto reactivado.");
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo reactivar el producto."));
    }
  }

  return (
    <div className="dashboard">
      {error && <div className="alert alert--error">{error}</div>}
      {mensaje && <div className="alert alert--success">{mensaje}</div>}

      {esAdmin && (
        <section className="dashboard-card role-manager">
          <h2>{productoEditandoId ? "Modificar producto" : "Nuevo producto"}</h2>
          <FormProducto
            valores={valores}
            onChange={setValores}
            onSubmit={handleSubmit}
            onCancel={cancelarEdicion}
            editando={productoEditandoId !== null}
          />
        </section>
      )}

      <section className="dashboard-card role-manager">
        <h2>Catálogo de productos</h2>
        {esAdmin && (
          <label>
            <input
              type="checkbox"
              checked={verInactivos}
              onChange={(event) => setVerInactivos(event.target.checked)}
            />{" "}
            Mostrar productos dados de baja
          </label>
        )}
        <TablaProductos
          productos={productos}
          esAdmin={esAdmin}
          onEdit={handleEdit}
          onBaja={handleBaja}
          onReactivar={handleReactivar}
        />
      </section>
    </div>
  );
}
