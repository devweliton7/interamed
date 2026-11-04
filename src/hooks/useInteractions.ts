// src/hooks/useInteractions.ts
import { useEffect, useState } from "react";
import { getInteractionsServerFn } from "../services/interactions/interactionsServer";
import type { InteractionResult } from "../services/interactions/mergeInteractions";

export function useInteractions(drugs: string[]) {
  const [data, setData] = useState<InteractionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (drugs.length < 2) {
      setData([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setProgress(0);

    const processInBatches = async () => {
      const BATCH_SIZE = 5;
      let allResults: InteractionResult[] = [];

      try {
        // Processa em lotes de 5 para não estourar o timeout da Vercel
        for (let i = 0; i < drugs.length; i += BATCH_SIZE) {
          if (!isMounted) return;

          const batch = drugs.slice(i, i + BATCH_SIZE);
          
          // Chama a server function para o lote atual
          const response = await getInteractionsServerFn({ data: { drugs: batch } });
          
          if (response?.interactions) {
            allResults = [...allResults, ...response.interactions];
            
            if (isMounted) {
              // Atualiza a UI progressivamente
              setData([...allResults]);
              setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / drugs.length) * 100)));
            }
          }
        }
      } catch (err) {
        if (isMounted) setError("Falha ao consultar interações.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setProgress(100);
        }
      }
    };

    processInBatches();

    return () => {
      isMounted = false;
    };
  }, [drugs]);

  return { data, loading, error, progress, refetch: () => {} };
}