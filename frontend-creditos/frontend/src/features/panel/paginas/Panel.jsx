import { useAuth } from "../../sesion/AuthContext";
import AdminPanel from './AdminPanel';
import VendedorPanel from './VendedorPanel';
import ClientePanel from './ClientePanel';

export default function Panel() {
  const { usuario } = useAuth();

  // Extraemos el rol desde el contexto global de autenticación
  const role = typeof usuario?.role === 'object' ? usuario.role?.name : usuario?.role;

  console.log("Usuario desde AuthContext:", usuario);
  console.log("Rol detectado:", role);

  // Renderizado condicional según el rol
  if (role === 'vendedor') {
    return <VendedorPanel />;
  }

  if (role === 'admin') {
    return <AdminPanel />;
  }

  // Por defecto o para clientes
  return <ClientePanel />;
}