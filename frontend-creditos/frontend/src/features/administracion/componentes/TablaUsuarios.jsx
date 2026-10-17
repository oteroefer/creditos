export default function TablaUsuarios({ usuarios, roles, onRoleChange }) {
  return (
    <div className="role-manager__table-wrap">
      <table className="role-manager__table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((cuenta) => (
            <tr key={cuenta.id}>
              <td>{cuenta.username}</td>
              <td>{cuenta.email}</td>
              <td>
                <select
                  aria-label={`Rol de ${cuenta.username}`}
                  value={cuenta.role?.id ?? ""}
                  onChange={(event) => onRoleChange(cuenta.id, event.target.value)}
                >
                  <option value="">Sin rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
