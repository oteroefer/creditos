import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Estructura de las páginas sin sesión (login y registro): barra superior y la página debajo
export default function LayoutPublico() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}
