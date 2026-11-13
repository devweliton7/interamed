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

  // 1. Normaliza todos os remédios via RxNorm
  const normalized = await normalizeDrugList(drugNames);

  // 2. Monta os pares
  const pares: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      pares.push({
        a: normalized[i].normalizedName || normalized[i].originalName,
        b: normalized[j].normalizedName || normalized[j].originalName,
      });
    }
  }

  // 3. Roda com concorrência 3 (OpenFDA é mais lenta e tem limite de requisições)
  const results = await runWithConcurrency(pares, 3, async (par) => {
    // Base local primeiro (instantânea)
    const local = findLocalInteraction(par.a, par.b);

    // OpenFDA via API real
    const openFda = await fetchDDInterPair(par.a, par.b);

    return mergeInteraction(par.a, par.b, openFda, local);
  });

  return results;
}

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}