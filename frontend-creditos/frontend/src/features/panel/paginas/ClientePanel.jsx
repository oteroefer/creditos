import React from 'react';
import CatalogoCliente from "../../productos/componentes/CatalogoCliente";

// El saludo al usuario se muestra en el encabezado (layout/Encabezado.jsx).
export default function ClientePanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-superficie border border-solid border-borde rounded-xl p-6">
        <h3 className="text-lg font-semibold text-texto mb-2">Estado de tus Créditos</h3>
        <p className="text-texto-suave">
          Bienvenido al sistema de ventas de créditos. Aquí podrás consultar tus cuotas y pagos pendientes próximamente.
        </p>
      </div>

      <CatalogoCliente limite={4} />
    </div>
  );
}
