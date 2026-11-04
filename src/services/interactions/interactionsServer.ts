// src/services/interactions/interactionsServer.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkInteractions } from "./interactionsService";

const schema = z.object({
  drugs: z.array(z.string()).min(2),
});

export const getInteractionsServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    try {
      const interactions = await checkInteractions(data.drugs);
      return { interactions };
    } catch (err) {
      console.error("Erro no servidor ao checar interações:", err);
      throw new Error("Falha ao consultar interações no servidor.");
    }
  });