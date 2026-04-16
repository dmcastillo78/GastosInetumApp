import react from "@vitejs/plugin-react";
import fs from "fs";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/GastosInetumApp/' : '/tabs/home/',
  esbuild: {
    tsconfigRaw: fs.readFileSync("./tsconfig.app.json"),
  },
  server: {
    port: 5173,
    https: {
      cert: fs.readFileSync("/Users/david/.fx/certificate/localhost.crt"),
      key: fs.readFileSync("/Users/david/.fx/certificate/localhost.key"),
    },
  },
}));
