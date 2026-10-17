import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/sesion/AuthContext";
import Layout from "./layout/Layout";
import LayoutPublico from "./layout/LayoutPublico";
import RutaProtegida from "./features/sesion/componentes/RutaProtegida";
import RutaAdmin from "./features/sesion/componentes/RutaAdmin";
import Login from "./features/sesion/paginas/Login";
import Registro from "./features/sesion/paginas/Registro";
import Panel from "./features/panel/paginas/Panel";
import PaginaUsuarios from "./features/administracion/paginas/PaginaUsuarios";
import PaginaRoles from "./features/administracion/paginas/PaginaRoles";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<LayoutPublico />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>
          <Route
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route path="/dashboard" element={<Panel />} />
            <Route
              path="/usuarios"
              element={
                <RutaAdmin>
                  <PaginaUsuarios />
                </RutaAdmin>
              }
            />
            <Route
              path="/roles"
              element={
                <RutaAdmin>
                  <PaginaRoles />
                </RutaAdmin>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
