import React from 'react';

// El saludo al usuario se muestra en el encabezado (layout/Encabezado.jsx).
export default function VendedorPanel() {
  return (
    <div className="p-6 space-y-6">
      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Ventas Registradas Hoy</h3>
          <p className="text-3xl font-bold text-texto mt-2">0</p>
        </div>
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Créditos Activos en Cartera</h3>
          <p className="text-3xl font-bold text-texto mt-2">-</p>
        </div>
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Próximos Cobros / Cuotas</h3>
          <p className="text-3xl font-bold text-texto mt-2">-</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-superficie border border-solid border-borde rounded-xl p-6">
        <h2 className="text-lg font-semibold text-texto mb-4">Acciones Principales</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-violeta text-negro border-0 px-4 py-2 rounded-md hover:bg-violeta-claro transition">
            + Nuevo Crédito / Venta
          </button>
          <button className="bg-lavanda text-texto border-0 px-4 py-2 rounded-md hover:bg-violeta-claro transition">
            Buscar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}