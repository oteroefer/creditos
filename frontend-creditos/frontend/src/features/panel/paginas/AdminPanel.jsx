import React from 'react';
import { Link } from "react-router-dom";

const secciones = [
  {
    ruta: "/usuarios",
    titulo: "Gestión de Usuarios",
    descripcion: "Administra altas, bajas y perfiles de usuarios del sistema.",
  },
  {
    ruta: "/roles",
    titulo: "Control de Roles",
    descripcion: "Configura permisos y accesos por rol.",
  },
  {
    ruta: "/productos",
    titulo: "Catálogo de Productos",
    descripcion: "Carga productos, precios, stock e imágenes.",
  },
];

// El saludo al usuario se muestra en el encabezado (layout/Encabezado.jsx).
export default function AdminPanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secciones.map(({ ruta, titulo, descripcion }) => (
          <Link
            key={ruta}
            to={ruta}
            className="block rounded-xl border border-solid border-borde bg-superficie p-6 no-underline transition hover:-translate-y-0.5 hover:border-violeta hover:shadow-md"
          >
            <h3 className="font-semibold text-texto text-lg">{titulo}</h3>
            <p className="text-texto-suave text-sm mt-1">{descripcion}</p>
            <span className="mt-4 inline-block text-sm font-medium text-violeta-oscuro">Ir a la sección →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
