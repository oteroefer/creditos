
import React, { useState, useEffect } from 'react';
import { listarUsuarios } from '../api';

export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await listarUsuarios();
                setUsuarios(data);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                setError("No se pudieron cargar los usuarios.");
            } finally {
                setLoading(false);
            }
        };

        cargarUsuarios();
    }, []);

    const obtenerEstiloRol = (rol) => {
        const estilos = {
            admin: {
                backgroundColor: '#ede9fe',
                color: '#6d28d9'
            },
            vendedor: {
                backgroundColor: '#dbeafe',
                color: '#1d4ed8'
            },
            cliente: {
                backgroundColor: '#f3f4f6',
                color: '#4b5563'
            }
        };

        return estilos[rol?.toLowerCase()] || estilos.cliente;
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
                    maxWidth: '1000px'
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
                    Consulta los usuarios registrados y sus respectivos roles.
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
                                <th style={{
                                    padding: '0 16px 14px 0',
                                    fontWeight: '600',
                                    width: '35%'
                                }}>
                                    Usuario
                                </th>

                                <th style={{
                                    padding: '0 16px 14px 0',
                                    fontWeight: '600',
                                    width: '45%'
                                }}>
                                    Correo electrónico
                                </th>

                                <th style={{
                                    padding: '0 0 14px 0',
                                    fontWeight: '600',
                                    width: '20%'
                                }}>
                                    Rol
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>

                            ) : error ? (
                                <tr>
                                    <td colSpan="3" style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        color: '#dc2626',
                                        fontSize: '14px'
                                    }}>
                                        {error}
                                    </td>
                                </tr>

                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                        fontSize: '14px'
                                    }}>
                                        No hay usuarios registrados.
                                    </td>
                                </tr>

                            ) : (
                                usuarios.map((u) => (
                                    <tr
                                        key={u.id}
                                        style={{
                                            borderBottom: '1px solid #f3f4f6',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <td style={{
                                            padding: '18px 16px 18px 0',
                                            color: '#1f2937',
                                            fontWeight: '600'
                                        }}>
                                            {u.username}
                                        </td>

                                        <td style={{
                                            padding: '18px 16px 18px 0',
                                            color: '#6b7280'
                                        }}>
                                            {u.email}
                                        </td>

                                        <td style={{
                                            padding: '18px 0'
                                        }}>
                                            <span style={{
                                                ...obtenerEstiloRol(u.role?.name),
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                display: 'inline-block',
                                                textTransform: 'capitalize'
                                            }}>
                                                {u.role?.name || 'cliente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    );
}
