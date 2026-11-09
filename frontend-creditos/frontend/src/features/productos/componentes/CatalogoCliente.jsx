import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarProductos } from "../api";
import { formatearPrecio } from "../formato";

// Vitrina de productos para el cliente. El backend solo le devuelve los activos y acá no
// se muestra el stock. Con limite muestra solo los primeros (vista previa del panel) y un
// enlace a la página de Productos con el catálogo completo.
export default function CatalogoCliente({ limite }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarProductos()
      .then(setProductos)
      .catch(() => setError("No se pudo cargar el catálogo."))
      .finally(() => setCargando(false));
  }, []);

  const visibles = limite ? productos.slice(0, limite) : productos;

  return (
    <section className="rounded-xl border border-borde bg-superficie p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Catálogo</h2>
        {limite && productos.length > limite && (
          <Link to="/productos" className="text-sm font-medium text-violeta-oscuro no-underline hover:underline">
            Ver todos los productos ({productos.length}) →
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-texto-suave">
        Elegí un producto para comprarlo en cuotas.
      </p>

      {cargando && <p className="mt-6 text-sm text-texto-suave">Cargando productos...</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-peligro-fondo px-4 py-3 text-sm text-peligro">{error}</p>
      )}
      {!cargando && !error && productos.length === 0 && (
        <p className="mt-6 text-sm text-texto-suave">Todavía no hay productos disponibles.</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibles.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
}

function TarjetaProducto({ producto }) {
  // No se muestra la cantidad: si no hay stock, solo se avisa que no está disponible.
  const disponible = producto.stock > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-borde bg-superficie transition hover:shadow-md">
      <div className="aspect-[4/3] bg-lavanda">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="block h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-texto-suave">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-texto-suave">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-semibold text-texto">
            {formatearPrecio(producto.precio)}
          </span>
          {!disponible && (
            <span className="rounded-full bg-lavanda px-2.5 py-0.5 text-xs text-texto-suave">
              No disponible
            </span>
          )}
        </div>
        <Link
          to={`/productos/${producto.id}`}
          className="mt-2 rounded-md bg-violeta px-4 py-2.5 text-center text-sm font-medium text-negro no-underline transition hover:bg-violeta-claro"
          aria-label={`Ver más sobre ${producto.nombre}`}
        >
          Ver más
        </Link>
      </div>
    </article>
  );
}
