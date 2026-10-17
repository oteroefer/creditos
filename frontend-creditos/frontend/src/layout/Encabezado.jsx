import { useLocation } from "react-router-dom";
import { useAuth } from "../features/sesion/AuthContext";
import grupos from "./enlaces";

// Barra superior del contenido: título de la página actual y usuario
export default function Encabezado() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const titulo =
    grupos
      .flatMap((grupo) => grupo.enlaces)
      .find((enlace) => enlace.ruta === pathname)?.texto ?? "";

  return (
    <header className="encabezado">
      <h1>{titulo}</h1>
      <div className="encabezado__usuario">
        <span>{usuario?.username}</span>
        <span className="avatar">{usuario?.username?.[0]}</span>
      </div>
    </header>
  );
}
