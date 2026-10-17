import { useEffect, useState } from "react";
import { asignarRol, listarRoles, listarUsuarios } from "../api";
import TablaUsuarios from "../componentes/TablaUsuarios";

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {
    const [usuariosData, rolesData] = await Promise.all([
      listarUsuarios(),
      listarRoles(),
    ]);
    setUsuarios(usuariosData);
    setRoles(rolesData);
  }

  useEffect(() => {
    cargarDatos().catch(() => setError("No se pudieron cargar los usuarios."));
  }, []);

  async function handleRoleChange(userId, value) {
    setError("");
    setMensaje("");
    try {
      await asignarRol(userId, value === "" ? null : Number(value));
      await cargarDatos();
      setMensaje("Rol actualizado.");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo actualizar el rol.");
    }
  }

  return (
    <div className="dashboard">
      <section className="dashboard-card role-manager">
        <p>Elige el rol de cada usuario desde la lista.</p>

        {error && <div className="alert alert--error">{error}</div>}
        {mensaje && <div className="alert alert--success">{mensaje}</div>}

        <TablaUsuarios
          usuarios={usuarios}
          roles={roles}
          onRoleChange={handleRoleChange}
        />
      </section>
    </div>
  );
}
