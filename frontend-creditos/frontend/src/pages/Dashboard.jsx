import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  asignarRol,
  actualizarRol,
  crearRol,
  eliminarRol,
  listarRoles,
  listarUsuarios,
} from "../services/api";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nombreRol, setNombreRol] = useState("");
  const [rolEditandoId, setRolEditandoId] = useState(null);
  const [nombreRolEditado, setNombreRolEditado] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarAdministracion() {
    const [usuariosData, rolesData] = await Promise.all([
      listarUsuarios(),
      listarRoles(),
    ]);
    setUsuarios(usuariosData);
    setRoles(rolesData);
  }

  useEffect(() => {
    if (usuario?.role !== "admin") return;
    cargarAdministracion().catch(() =>
      setError("No se pudo cargar la administración de roles."),
    );
  }, [usuario?.role]);

  async function handleRoleChange(userId, value) {
    setError("");
    setMensaje("");
    try {
      await asignarRol(userId, value === "" ? null : Number(value));
      await cargarAdministracion();
      setMensaje("Rol actualizado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo actualizar el rol.");
    }
  }

  async function handleCreateRole(event) {
    event.preventDefault();
    setError("");
    setMensaje("");
    try {
      await crearRol(nombreRol);
      setNombreRol("");
      await cargarAdministracion();
      setMensaje("Rol creado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo crear el rol.");
    }
  }

  function handleEditRole(rol) {
    setError("");
    setMensaje("");
    setRolEditandoId(rol.id);
    setNombreRolEditado(rol.name);
  }

  async function handleUpdateRole(event, roleId) {
    event.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarRol(roleId, nombreRolEditado);
      setRolEditandoId(null);
      setNombreRolEditado("");
      await cargarAdministracion();
      setMensaje("Rol modificado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo modificar el rol.");
    }
  }

  function handleCancelRoleEdit() {
    setRolEditandoId(null);
    setNombreRolEditado("");
  }

  async function handleDeleteRole(rol) {
    if (!window.confirm(`¿Seguro que quieres eliminar el rol "${rol.name}"?`)) {
      return;
    }

    setError("");
    setMensaje("");
    try {
      await eliminarRol(rol.id);
      await cargarAdministracion();
      setMensaje("Rol eliminado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo eliminar el rol.");
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Hola, {usuario?.username}</h1>
        <p>Panel principal del sistema de ventas de créditos.</p>
      </div>

      <div className="dashboard-card">
        <h3>Panel principal</h3>
        <p>
          Bienvenido al sistema de ventas de créditos. Más avances pronto.
        </p>
      </div>

      {usuario?.role === "admin" && (
        <section className="dashboard-card role-manager">
          <h2>Administrar usuarios y roles</h2>
          <p>Asigna un rol existente, crea uno nuevo o modifica los roles.</p>

          {error && <div className="alert alert--error">{error}</div>}
          {mensaje && <div className="alert alert--success">{mensaje}</div>}

          <form className="role-manager__create" onSubmit={handleCreateRole}>
            <label className="field">
              <span>Nuevo rol</span>
              <input
                value={nombreRol}
                onChange={(event) => setNombreRol(event.target.value)}
                minLength={2}
                maxLength={50}
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Crear rol
            </button>
          </form>

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
                        onChange={(event) =>
                          handleRoleChange(cuenta.id, event.target.value)
                        }
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
                          onSubmit={(event) => handleUpdateRole(event, rol.id)}
                        >
                          <input
                            id={`role-${rol.id}`}
                            aria-label={`Nombre del rol ${rol.name}`}
                            value={nombreRolEditado}
                            onChange={(event) =>
                              setNombreRolEditado(event.target.value)
                            }
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
                            onClick={handleCancelRoleEdit}
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
                            onClick={() => handleEditRole(rol)}
                            aria-label={`Modificar rol ${rol.name}`}
                          >
                            Modificar
                          </button>
                          <button
                            className="role-manager__action role-manager__action--danger"
                            type="button"
                            onClick={() => handleDeleteRole(rol)}
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
        </section>
      )}
    </div>
  );
}
