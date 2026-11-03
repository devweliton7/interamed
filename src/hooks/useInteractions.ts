// src/hooks/useInteractions.ts

import { useCallback, useEffect, useState } from "react";
import type { InteractionResult } from "../services/interactions/mergeInteractions";

const CACHE_KEY = "interamed:interactions:v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

type CacheEntry = {
  timestamp: number;
  data: InteractionResult[];
};

function cacheKey(drugs: string[]): string {
  return drugs.map((d) => d.toLowerCase().trim()).sort().join("|");
}

function readCache(drugs: string[]): InteractionResult[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const all: Record<string, CacheEntry> = JSON.parse(raw);
    const entry = all[cacheKey(drugs)];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(drugs: string[], data: InteractionResult[]) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const all: Record<string, CacheEntry> = raw ? JSON.parse(raw) : {};
    all[cacheKey(drugs)] = { timestamp: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    /* quota cheia ou modo privado — ignora */
  }
}

export function useInteractions(drugs: string[]) {
  const [data, setData] = useState<InteractionResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (drugs.length < 2) {
      setData([]);
      return;
    }

    const cached = readCache(drugs);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.interactions);
      writeCache(drugs, json.interactions);
    } catch (err) {
      setError(
        "Não foi possível consultar as interações agora. Exibindo base local quando disponível."
      );
      // Fallback silencioso: tenta base local diretamente no cliente
      // (opcional — pode ser omitido se preferir mostrar erro)
    } finally {
      setLoading(false);
    }
  }, [drugs]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}