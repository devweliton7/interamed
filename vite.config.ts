// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode, command }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [
      tailwindcss(),
      // 🔑 O NITRO SÓ É ATIVADO NO BUILD (Deploy), NÃO NO DEV
      command === "build" ? nitro() : null,
      tanstackStart({ server: { entry: "server" } }),
      viteReact(),
    ].filter(Boolean), // Limpa o 'null' caso esteja em modo dev
    resolve: { tsconfigPaths: true },
    ssr: {
      noExternal: ["pdfjs-dist"], // Resolve o warning do PDF.js
    },
  };
});