import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RutaAdmin({ children }) {
  const { usuario } = useAuth();
  if (usuario?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
