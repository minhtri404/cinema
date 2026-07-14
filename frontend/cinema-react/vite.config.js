import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/uploads": {
        target: "http://localhost:18081",
        changeOrigin: true,
      },
      "/media": {
        target: "http://localhost:18080",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:18080",
        changeOrigin: true,
      },
    },
  },
});
