import { useEffect, useState } from "react";
import { actualizarRol, crearRol, eliminarRol, listarRoles } from "../api";
import FormNuevoRol from "../componentes/FormNuevoRol";
import TablaRoles from "../componentes/TablaRoles";

export default function PaginaRoles() {
  const [roles, setRoles] = useState([]);
  const [nombreRol, setNombreRol] = useState("");
  const [rolEditandoId, setRolEditandoId] = useState(null);
  const [nombreRolEditado, setNombreRolEditado] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarRoles() {
    setRoles(await listarRoles());
  }

  useEffect(() => {
    cargarRoles().catch(() => setError("No se pudieron cargar los roles."));
  }, []);

  async function handleCreateRole(event) {
    event.preventDefault();
    setError("");
    setMensaje("");
    try {
      await crearRol(nombreRol);
      setNombreRol("");
      await cargarRoles();
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
      await cargarRoles();
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
      await cargarRoles();
      setMensaje("Rol eliminado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo eliminar el rol.");
    }
  }

  return (
    <div className="dashboard">
      {error && <div className="alert alert--error">{error}</div>}
      {mensaje && <div className="alert alert--success">{mensaje}</div>}

      <section className="dashboard-card role-manager">
        <h2>Crear rol</h2>
        <p>El rol nuevo queda disponible para asignarlo en Usuarios.</p>
        <FormNuevoRol
          nombreRol={nombreRol}
          onNombreChange={setNombreRol}
          onSubmit={handleCreateRole}
        />
      </section>

      <section className="dashboard-card role-manager">
        <h2>Roles creados</h2>
        <TablaRoles
          roles={roles}
          rolEditandoId={rolEditandoId}
          nombreRolEditado={nombreRolEditado}
          onNombreEditadoChange={setNombreRolEditado}
          onEdit={handleEditRole}
          onUpdate={handleUpdateRole}
          onCancelEdit={handleCancelRoleEdit}
          onDelete={handleDeleteRole}
        />
      </section>
    </div>
  );
}
