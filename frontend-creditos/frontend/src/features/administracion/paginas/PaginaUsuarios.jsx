import React, { useState, useEffect } from 'react';
import { listarUsuarios, listarRoles, asignarRol } from '../api';

export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [usuariosData, rolesData] = await Promise.all([
                listarUsuarios(),
                listarRoles()
            ]);
            setUsuarios(usuariosData);
            setRoles(rolesData);
            
            // Inicializar el estado local con el ID de rol actual de cada usuario
            const initialRoles = {};
            usuariosData.forEach(u => {
                const currentRoleId = u.role_id || rolesData.find(r => r.name.toLowerCase() === (u.role?.name || u.role)?.toLowerCase())?.id || '';
                initialRoles[u.id] = currentRoleId;
            });
            setSelectedRoles(initialRoles);
            setError(null);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setError("No se pudieron cargar los datos del servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleSelectChange = (userId, value) => {
        setSelectedRoles(prev => ({
            ...prev,
            [userId]: Number(value)
        }));
    };

    const handleConfirmar = async (userId) => {
        const nuevoRoleId = selectedRoles[userId];
        try {
            await asignarRol(userId, nuevoRoleId);
            alert("¡Rol actualizado con éxito en la base de datos!");
            await cargarDatos(); // Refrescar los datos para ver los cambios actualizados
        } catch (err) {
            console.error("Error al actualizar rol:", err);
            alert("Hubo un error al actualizar el rol.");
        }
    };

    return (
        <div style={{ padding: '24px' }}>

            {/* TARJETA PRINCIPAL */}
            <div
                className="dashboard-card"
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #f0f0f5',
                    maxWidth: '1100px'
                }}
            >

                {/* ENCABEZADO */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1a1d36',
                        margin: 0
                    }}>
                        Usuarios
                    </h2>

                    <span style={{
                        backgroundColor: '#ede9fe',
                        color: '#6d28d9',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        {usuarios.length} registrados
                    </span>
                </div>

                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '28px'
                }}>
                    Consulta los usuarios registrados y gestiona sus roles en la base de datos.
                </p>

                {/* TABLA */}
                <div style={{ overflowX: 'auto' }}>

                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    }}>

                        <thead>
                            <tr style={{
                                borderBottom: '1px solid #e5e7eb',
                                color: '#6b7280',
                                fontSize: '13px'
                            }}>
                                <th style={{ padding: '0 16px 14px 0', fontWeight: '600', width: '30%' }}>
                                    Usuario
                                </th>
                                <th style={{ padding: '0 16px 14px 0', fontWeight: '600', width: '40%' }}>
                                    Correo electrónico
                                </th>
                                <th style={{ padding: '0 0 14px 0', fontWeight: '600', width: '30%' }}>
                                    Rol / Acción
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>

                            ) : error ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
                                        {error}
                                    </td>
                                </tr>

                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                        No hay usuarios registrados.
                                    </td>
                                </tr>

                            ) : (
                                usuarios.map((u) => {
                                    const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
                                    const isAdminCecilia = u.username === 'cecilia' && roleName === 'admin';

                                    return (
                                        <tr
                                            key={u.id}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <td style={{ padding: '18px 16px 18px 0', color: '#1f2937', fontWeight: '600' }}>
                                                {u.username}
                                            </td>

                                            <td style={{ padding: '18px 16px 18px 0', color: '#6b7280' }}>
                                                {u.email}
                                            </td>

                                            <td style={{ padding: '18px 0' }}>
                                                {isAdminCecilia ? (
                                                    <span style={{
                                                        backgroundColor: '#ede9fe',
                                                        color: '#6d28d9',
                                                        padding: '5px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'inline-block'
                                                    }}>
                                                        Admin (Reservado)
                                                    </span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <select
                                                            value={selectedRoles[u.id] || ''}
                                                            onChange={(e) => handleSelectChange(u.id, e.target.value)}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '8px',
                                                                border: '1px solid #d1d5db',
                                                                backgroundColor: '#f9fafb',
                                                                fontSize: '13px',
                                                                color: '#1f2937',
                                                                outline: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {roles.map((r) => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleConfirmar(u.id)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#7c3aed',
                                                                color: '#ffffff',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                                                            onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                                                        >
                                                            Confirmar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}

                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    );
}