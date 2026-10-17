import { useEffect, useState } from "react";
import {
  asignarRol,
  actualizarRol,
  crearRol,
  eliminarRol,
  listarRoles,
  listarUsuarios,
} from "./api";
import FormNuevoRol from "./componentes/FormNuevoRol";
import TablaUsuarios from "./componentes/TablaUsuarios";
import TablaRoles from "./componentes/TablaRoles";

export default function Administracion() {
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
    cargarAdministracion().catch(() =>
      setError("No se pudo cargar la administración de roles."),
    );
  }, []);

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
    <section className="dashboard-card role-manager">
      <h2>Administrar usuarios y roles</h2>
      <p>Asigna un rol existente, crea uno nuevo o modifica los roles.</p>

      {error && <div className="alert alert--error">{error}</div>}
      {mensaje && <div className="alert alert--success">{mensaje}</div>}

      <FormNuevoRol
        nombreRol={nombreRol}
        onNombreChange={setNombreRol}
        onSubmit={handleCreateRole}
      />

      <TablaUsuarios
        usuarios={usuarios}
        roles={roles}
        onRoleChange={handleRoleChange}
      />

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
  );
}
