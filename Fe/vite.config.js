import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false,
    },
    proxy: {
      "/uploads": new URL(process.env.VITE_API_BASE_URL || `http://localhost:${process.env.BE_PORT || 8080}/api`).origin,
    },
  },
});
