export default function FormNuevoRol({ nombreRol, onNombreChange, onSubmit }) {
  return (
    <form className="role-manager__create" onSubmit={onSubmit}>
      <label className="field">
        <span>Nuevo rol</span>
        <input
          value={nombreRol}
          onChange={(event) => onNombreChange(event.target.value)}
          minLength={2}
          maxLength={50}
          required
        />
      </label>
      <button className="btn-primary" type="submit">
        Crear rol
      </button>
    </form>
  );
}
