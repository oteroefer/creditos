import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarUsuario } from "../api";

export default function Registro() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "cliente" });
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await registrarUsuario(form);
      setExito(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || "No se pudo crear el usuario.");
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
        <p className="auth-card__eyebrow">Primera vez aquí</p>
        <h1>Crear cuenta</h1>

        {error && <div className="alert alert--error">{error}</div>}
        {exito && (
          <div className="alert alert--success">
            Cuenta creada. Redirigiendo al inicio de sesión...
          </div>
        )}

        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="role">Rol de usuario</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={cargando}>
          {cargando ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
