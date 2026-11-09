import { useLocation } from "react-router-dom";
import { useAuth } from "../features/sesion/AuthContext";
import grupos from "./enlaces";

// Barra superior del contenido: título de la página actual y usuario.
// En el panel principal el título es el saludo al usuario. Las subpáginas (por ejemplo
// /productos/5) muestran el título de su sección.
export default function Encabezado() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const titulo =
    pathname === "/dashboard"
      ? `Te damos la bienvenida, ${usuario?.username}!`
      : grupos
          .flatMap((grupo) => grupo.enlaces)
          .find((enlace) => pathname === enlace.ruta || pathname.startsWith(`${enlace.ruta}/`))
          ?.texto ?? "";

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
