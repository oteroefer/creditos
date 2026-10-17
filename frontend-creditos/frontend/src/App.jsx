import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/sesion/AuthContext";
import Navbar from "./compartido/componentes/Navbar";
import Layout from "./layout/Layout";
import RutaProtegida from "./features/sesion/componentes/RutaProtegida";
import RutaAdmin from "./features/sesion/componentes/RutaAdmin";
import Login from "./features/sesion/paginas/Login";
import Registro from "./features/sesion/paginas/Registro";
import Panel from "./features/panel/paginas/Panel";
import PaginaAdministracion from "./features/administracion/paginas/PaginaAdministracion";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              element={
                <RutaProtegida>
                  <Layout />
                </RutaProtegida>
              }
            >
              <Route path="/dashboard" element={<Panel />} />
              <Route
                path="/administracion"
                element={
                  <RutaAdmin>
                    <PaginaAdministracion />
                  </RutaAdmin>
                }
              />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
