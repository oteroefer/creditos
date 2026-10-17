import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Encabezado from "./Encabezado";

// Estructura de las páginas con sesión iniciada: sidebar a la izquierda y la página a la derecha
export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__contenido">
        <Encabezado />
        <Outlet />
      </main>
    </div>
  );
}
