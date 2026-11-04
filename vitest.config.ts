// vitest.config.ts
import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [viteReact()],
  test: {
    // 🔑 Resolve "describe is not defined"
    globals: true,
    
    // 🔑 Resolve "module is not defined" (React)
    environment: "jsdom",
    
    // 🔑 Roda seu arquivo de setup
    setupFiles: ["./src/test/setup.ts"],
    
    // 🔑 Resolve "close timed out"
    pool: "forks",
    teardownTimeout: 5000,
    
    // 🔑 Resolve "0 tests": Força o Vitest a olhar dentro de src/
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    
    // 🔑 Otimiza o carregamento do React nos testes
    server: {
      deps: {
        inline: ["react", "react-dom", "react/jsx-runtime"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});