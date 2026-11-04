import React from 'react';
import { useAuth } from "../../sesion/AuthContext";

export default function ClientePanel() {
  const { usuario } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {usuario?.username || "Cliente"} 👋
        </h1>
        <p className="text-gray-600 mt-1">Panel principal del sistema de ventas de créditos.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Estado de tus Créditos</h3>
        <p className="text-gray-600">
          Bienvenido al sistema de ventas de créditos. Aquí podrás consultar tus cuotas y pagos pendientes próximamente.
        </p>
      </div>
    </div>
  );
}