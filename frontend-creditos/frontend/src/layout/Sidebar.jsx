import { NavLink } from "react-router-dom";
import { useAuth } from "../features/sesion/AuthContext";

// Para agregar una sección nueva al menú, sumar un objeto a esta lista.
// soloAdmin: true la oculta para los usuarios que no son administradores.
const enlaces = [
  { ruta: "/dashboard", texto: "Panel principal" },
  { ruta: "/administracion", texto: "Usuarios y roles", soloAdmin: true },
];

export default function Sidebar() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.role === "admin";

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {enlaces
          .filter((enlace) => !enlace.soloAdmin || esAdmin)
          .map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) =>
                isActive ? "sidebar__link sidebar__link--activo" : "sidebar__link"
              }
            >
              {enlace.texto}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
