// src/hooks/useInteractions.ts
import { useQuery } from "@tanstack/react-query";
import { getInteractionsServerFn } from "../services/interactions/interactionsServer";
import { type InteractionResult } from "../services/interactions/mergeInteractions";

export function useInteractions(drugs: string[]) {
  const query = useQuery({
    queryKey: ["interactions", drugs],
    queryFn: async (): Promise<InteractionResult[]> => {
      if (drugs.length < 2) return [];
      
      console.log("📡 [Frontend] Enviando para o servidor:", drugs);

      try {
        const response = await getInteractionsServerFn({
          data: { medicamentos: drugs },
        });

        console.log("✅ [Frontend] Resposta recebida:", response);

        if (response.status === "erro") {
          throw new Error(response.mensagem);
        }

        return response.interacoes || [];
      } catch (error) {
        console.error("🚨 [Frontend] Erro na chamada do Server Function:", error);
        throw error;
      }
    },
    enabled: drugs.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    interactionsData: query.data,
    loadingInteractions: query.isLoading || query.isFetching,
    error: query.error,
  };
}