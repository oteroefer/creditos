import React from 'react';
import { useAuth } from "../../sesion/AuthContext";

export default function AdminPanel() {
  const { usuario } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mt-1">Bienvenido administrador, {usuario?.username}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-600">
          <h3 className="font-semibold text-gray-800 text-lg">Gestión de Usuarios</h3>
          <p className="text-gray-500 text-sm mt-1">Administra altas, bajas y perfiles de usuarios del sistema.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-600">
          <h3 className="font-semibold text-gray-800 text-lg">Control de Roles</h3>
          <p className="text-gray-500 text-sm mt-1">Configura permisos y accesos por rol.</p>
        </div>
      </div>
    </div>
  );
}