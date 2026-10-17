import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Puerto 5173 es default de Vite; el backend FastAPI corre en el 8000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Las llamadas al backend salen con /api adelante (por ejemplo /api/roles) y acá se
    // quita antes de reenviarlas. Así las páginas del frontend no chocan con las rutas de la API.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
