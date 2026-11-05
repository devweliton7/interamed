// src/services/interactions/interactionsService.ts
import { normalizeDrugList } from "./normalizeDrug";
import { fetchDDInterPair } from "./ddinterClient";
import { findLocalInteraction } from "./localInteractions";
import { mergeInteraction, type InteractionResult } from "./mergeInteractions";

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );

  return results;
}

export async function checkInteractions(
  drugNames: string[]
): Promise<InteractionResult[]> {
  if (drugNames.length < 2) return [];

  const normalized = await normalizeDrugList(drugNames);

  // 1. Monta todos os pares de uma vez
  const pares: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      pares.push({
        a: normalized[i].originalName,
        b: normalized[j].originalName,
      });
    }
  }

  // 2. Roda em paralelo com concorrência controlada
  const results = await runWithConcurrency(pares, 10, async (par) => {
    // Base local primeiro (instantânea)
    const local = findLocalInteraction(par.a, par.b);

    // API Externa: Como o DDInter caiu, o fetchDDInterPair vai retornar null na hora.
    // Deixamos a chamada aqui preparada para o futuro.
    const ddinter = await fetchDDInterPair(par.a, par.b);

    return mergeInteraction(par.a, par.b, ddinter, local);
  });

  return results;
}

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}