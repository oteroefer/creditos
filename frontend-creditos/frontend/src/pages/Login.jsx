import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      // Llama a POST /auth/login en el backend (ver src/services/api.js)
      const data = await iniciarSesion({ username, password });
      login({ user_id: data.user_id, username: data.username });
      navigate("/dashboard");
    } catch (err) {
      // FastAPI devuelve el mensaje de error en err.response.data.detail
      if (err.response) {
        setError(err.response.data?.detail || "Usuario o contraseña incorrectos.");
      } else {
        setError("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-card__eyebrow">Bienvenido de vuelta</p>
        <h1>Iniciar sesión</h1>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="auth-card__footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
