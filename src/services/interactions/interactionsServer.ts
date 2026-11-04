// src/services/interactions/interactionsServer.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
// importe sua função checkInteractions original aqui

const schema = z.object({
  drugs: z.array(z.string()).min(2),
});

export const getInteractionsServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    try {
      // Aqui está o truque: chamamos o checkInteractions passando TODOS os remédios de uma vez.
      // Se a sua função checkInteractions já faz chamadas internas, ela precisa usar Promise.all.
      const interactions = await checkInteractions(data.drugs);
      return { interactions };
    } catch (err) {
      console.error("Erro no servidor:", err);
      return { interactions: [] };
    }
  });