import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    // A configuração explícita é o que resolve o problema.
    nitro({
      preset: "vercel",
      output: {
        dir: ".vercel/output",
        serverDir: ".vercel/output/functions/__server.func",
        publicDir: ".vercel/output/static",
      },
    }),
  ],
});