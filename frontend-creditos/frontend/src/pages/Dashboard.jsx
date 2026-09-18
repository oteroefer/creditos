import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Hola, {usuario?.username}</h1>
        <p>Panel principal del sistema de ventas de créditos.</p>
      </div>

      <div className="dashboard-card">
        <h3>Panel principal</h3>
        <p>
          Bienvenido al sistema de ventas de créditos. Más avances pronto.
        </p>
      </div>
    </div>
  );
}
