import { formatearPrecio } from "../formato";

export default function TablaProductos({ productos, esAdmin, onEdit, onBaja, onReactivar }) {
  if (productos.length === 0) {
    return <p>No hay productos cargados.</p>;
  }

  return (
    <div className="role-manager__table-wrap">
      <table className="role-manager__table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            {esAdmin && <th>Estado</th>}
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    width="64"
                    height="48"
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td>{producto.codigo}</td>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion || "-"}</td>
              <td>{formatearPrecio(producto.precio)}</td>
              <td>{producto.stock}</td>
              {esAdmin && <td>{producto.activo ? "Activo" : "Inactivo"}</td>}
              {esAdmin && (
                <td>
                  <div className="role-manager__actions">
                    <button
                      className="role-manager__action"
                      type="button"
                      onClick={() => onEdit(producto)}
                      aria-label={`Modificar producto ${producto.nombre}`}
                    >
                      Modificar
                    </button>
                    {producto.activo ? (
                      <button
                        className="role-manager__action role-manager__action--danger"
                        type="button"
                        onClick={() => onBaja(producto)}
                        aria-label={`Dar de baja producto ${producto.nombre}`}
                      >
                        Dar de baja
                      </button>
                    ) : (
                      <button
                        className="role-manager__action"
                        type="button"
                        onClick={() => onReactivar(producto)}
                        aria-label={`Reactivar producto ${producto.nombre}`}
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
