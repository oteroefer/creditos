export default function TablaRoles({
  roles,
  rolEditandoId,
  nombreRolEditado,
  onNombreEditadoChange,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
}) {
  return (
    <div className="role-manager__table-wrap">
      <table className="role-manager__table">
        <thead>
          <tr>
            <th>Roles creados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id}>
              <td>
                {rolEditandoId === rol.id ? (
                  <form
                    className="role-manager__edit"
                    onSubmit={(event) => onUpdate(event, rol.id)}
                  >
                    <input
                      id={`role-${rol.id}`}
                      aria-label={`Nombre del rol ${rol.name}`}
                      value={nombreRolEditado}
                      onChange={(event) => onNombreEditadoChange(event.target.value)}
                      minLength={2}
                      maxLength={50}
                      required
                    />
                    <button className="role-manager__action" type="submit">
                      Guardar
                    </button>
                    <button
                      className="role-manager__action"
                      type="button"
                      onClick={onCancelEdit}
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  rol.name
                )}
              </td>
              <td>
                {rol.name === "admin" ? (
                  <span>Rol reservado</span>
                ) : rolEditandoId !== rol.id ? (
                  <div className="role-manager__actions">
                    <button
                      className="role-manager__action"
                      type="button"
                      onClick={() => onEdit(rol)}
                      aria-label={`Modificar rol ${rol.name}`}
                    >
                      Modificar
                    </button>
                    <button
                      className="role-manager__action role-manager__action--danger"
                      type="button"
                      onClick={() => onDelete(rol)}
                      aria-label={`Eliminar rol ${rol.name}`}
                    >
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
