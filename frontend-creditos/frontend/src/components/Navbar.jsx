import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar__brand">
        Software de Ventas <span>· Créditos</span>
      </div>
      {usuario && (
        <div className="navbar__user">
          <span>{usuario.username}</span>
          <button className="navbar__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
