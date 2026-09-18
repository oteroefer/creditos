import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Puerto 5173 es default de Vite; el backend FastAPI corre en el 8000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/users": "http://localhost:8000",
      "/auth": "http://localhost:8000",
    },
  },
});
