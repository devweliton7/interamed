// src/hooks/useInteractions.ts
import { useEffect, useState } from "react";
import { getInteractionsServerFn } from "../services/interactions/interactionsServer";
import type { InteractionResult } from "../services/interactions/mergeInteractions";

export function useInteractions(drugs: string[]) {
  const [data, setData] = useState<InteractionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drugs.length < 2) {
      setData([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Chamada única com todos os remédios
    getInteractionsServerFn({ data: { drugs } })
      .then((res) => {
        if (isMounted) {
          setData(res?.interactions || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError("Falha ao consultar interações.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [drugs]);

  return { data, loading, error };
}