import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/uploads": {
        target: "http://localhost:18081",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:18081",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:18080",
        changeOrigin: true,
      },
    },
  },
});
