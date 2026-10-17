import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/sesion/AuthContext";
import Navbar from "./compartido/componentes/Navbar";
import RutaProtegida from "./features/sesion/componentes/RutaProtegida";
import Login from "./features/sesion/paginas/Login";
import Registro from "./features/sesion/paginas/Registro";
import Panel from "./features/panel/paginas/Panel";
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
              path="/dashboard"
              element={
                <RutaProtegida>
                  <Panel />
                </RutaProtegida>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
