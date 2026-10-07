import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin /api in dev - proxied to the backend, so no CORS. Port 4000
    // is backend/src/server.ts's default - change both together.
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
