// Formulario de alta y modificación de productos. Con editando en true muestra "Guardar cambios" y "Cancelar".
export default function FormProducto({ valores, onChange, onSubmit, onCancel, editando }) {
  function handleChange(event) {
    onChange({ ...valores, [event.target.name]: event.target.value });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="codigo">Código</label>
        <input
          id="codigo"
          name="codigo"
          value={valores.codigo}
          onChange={handleChange}
          maxLength={30}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          value={valores.nombre}
          onChange={handleChange}
          minLength={2}
          maxLength={100}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="descripcion">Descripción (opcional)</label>
        <input
          id="descripcion"
          name="descripcion"
          value={valores.descripcion}
          onChange={handleChange}
          maxLength={500}
        />
      </div>
      <div className="field">
        <label htmlFor="precio">Precio</label>
        <input
          id="precio"
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          value={valores.precio}
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="stock">Stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={valores.stock}
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="imagen_url">URL de la imagen (opcional)</label>
        <input
          id="imagen_url"
          name="imagen_url"
          type="url"
          value={valores.imagen_url}
          onChange={handleChange}
          maxLength={500}
        />
      </div>
      <div className="role-manager__actions">
        <button className="btn-primary" type="submit">
          {editando ? "Guardar cambios" : "Crear producto"}
        </button>
        {editando && (
          <button className="role-manager__action" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
