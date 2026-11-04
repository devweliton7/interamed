import { createAPIFileRoute } from "@tanstack/react-start/api";
import { checkInteractions } from "../../services/interactions/interactionsService";

export const APIRoute = createAPIFileRoute("/api/interactions")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { drugs } = body ?? {};

      if (!Array.isArray(drugs) || drugs.length < 2) {
        return new Response(
          JSON.stringify({
            error: "Envie um array 'drugs' com pelo menos 2 itens.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const interactions = await checkInteractions(drugs);

      return new Response(JSON.stringify({ interactions }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=3600, stale-while-revalidate",
        },
      });
    } catch (err) {
      console.error("Erro ao checar interações:", err);
      return new Response(
        JSON.stringify({ error: "Falha ao consultar interações." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
});