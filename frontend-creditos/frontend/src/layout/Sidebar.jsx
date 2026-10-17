import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/sesion/AuthContext";
import grupos from "./enlaces";
import { IconoSalir } from "./Iconos";

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const esAdmin = usuario?.role === "admin";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icono">C</span>
        Créditos
      </div>

      <nav className="sidebar__nav">
        {grupos
          .filter((grupo) => !grupo.soloAdmin || esAdmin)
          .map((grupo) => [
            <p key={grupo.titulo} className="sidebar__titulo">
              {grupo.titulo}
            </p>,
            grupo.enlaces.map(({ ruta, texto, icono: Icono }) => (
              <NavLink
                key={ruta}
                to={ruta}
                className={({ isActive }) =>
                  isActive ? "sidebar__link sidebar__link--activo" : "sidebar__link"
                }
              >
                <Icono />
                {texto}
              </NavLink>
            )),
          ])}
      </nav>

      <div className="sidebar__usuario">
        <span className="avatar">{usuario?.username?.[0]}</span>
        <div className="sidebar__usuario-datos">
          <p className="sidebar__usuario-nombre">{usuario?.username}</p>
          <p className="sidebar__usuario-rol">{usuario?.role ?? "Sin rol"}</p>
        </div>
        <button
          className="sidebar__salir"
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <IconoSalir />
        </button>
      </div>
    </aside>
  );
}
