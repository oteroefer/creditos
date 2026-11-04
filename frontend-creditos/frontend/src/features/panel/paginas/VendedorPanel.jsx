import React from 'react';
import { useAuth } from "../../sesion/AuthContext";

export default function VendedorPanel() {
  const { usuario } = useAuth();

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado de Bienvenida */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ¡Hola, {usuario?.username || "Vendedor"}! 🚀
        </h1>
        <p className="text-gray-600 mt-1">Panel de Vendedor - Gestión de créditos y cartera de clientes.</p>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-indigo-600 font-semibold text-sm">Ventas Registradas Hoy</h3>
          <p className="text-3xl font-bold text-indigo-900 mt-2">0</p>
        </div>
        <div className="bg-green-50 border border-green-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-green-600 font-semibold text-sm">Créditos Activos en Cartera</h3>
          <p className="text-3xl font-bold text-green-900 mt-2">-</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-amber-600 font-semibold text-sm">Próximos Cobros / Cuotas</h3>
          <p className="text-3xl font-bold text-amber-900 mt-2">-</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Principales</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            + Nuevo Crédito / Venta
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition">
            Buscar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}