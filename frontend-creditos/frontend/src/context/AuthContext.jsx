import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  function login(datosUsuario) {
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    if (datosUsuario.access_token) {
      localStorage.setItem("token", datosUsuario.access_token);
    }
    setUsuario(datosUsuario);
  }

  function logout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
