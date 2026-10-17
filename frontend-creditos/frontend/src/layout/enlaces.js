import { IconoEscudo, IconoInicio, IconoUsuarios } from "./Iconos";

// Secciones del menú, agrupadas por título. Para agregar una nueva, sumar un objeto
// en el grupo que corresponda. soloAdmin: true oculta el grupo a los que no son administradores.
const grupos = [
  {
    titulo: "Menú",
    enlaces: [{ ruta: "/dashboard", texto: "Panel principal", icono: IconoInicio }],
  },
  {
    titulo: "Administración",
    soloAdmin: true,
    enlaces: [
      { ruta: "/usuarios", texto: "Usuarios", icono: IconoUsuarios },
      { ruta: "/roles", texto: "Roles", icono: IconoEscudo },
    ],
  },
];

export default grupos;
