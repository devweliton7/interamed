// src/hooks/useInteractions.ts
import { useCallback, useEffect, useState } from "react";
import type { InteractionResult } from "../services/interactions/mergeInteractions";
import { findLocalInteraction } from "../services/interactions/localInteractions";
import { mergeInteraction } from "../services/interactions/mergeInteractions";

export function useInteractions(drugs: string[]) {
  const [data, setData] = useState<InteractionResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (drugs.length < 2) { setData([]); return; }

    setLoading(true);

    // 1. Gera o fallback local (Sempre roda, é a nossa garantia)
    const localResults: InteractionResult[] = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const local = findLocalInteraction(drugs[i]!, drugs[j]!);
        localResults.push(mergeInteraction(drugs[i]!, drugs[j]!, null, local));
      }
    }

    try {
      // 2. Tenta buscar na API (se estiver no Vercel Dev, vai funcionar)
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs }),
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.interactions && json.interactions.length > 0) {
          setData(json.interactions);
        } else {
          setData(localResults);
        }
      } else {
        setData(localResults);
      }
    } catch (err) {
      // Se a API der erro, engole e usa a base local
      setData(localResults);
    } finally {
      setLoading(false);
    }
  }, [drugs]);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error: null, refetch: run };
}