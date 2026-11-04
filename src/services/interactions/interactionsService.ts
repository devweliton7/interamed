// src/services/interactions/interactionsService.ts
import { normalizeDrugList } from "./normalizeDrug";
import { fetchDDInterPair } from "./ddinterClient";
import { findLocalInteraction } from "./localInteractions";
import {
  mergeInteraction,
  type InteractionResult,
} from "./mergeInteractions";

/**
 * Timeout seguro: resolve com `fallback` se a promise demorar mais que `ms`.
 * Usado pra impedir que DDInter lento trave a análise inteira.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Executa promessas com concorrência limitada.
 * Evita mandar 400+ requests simultâneas pra DDInter e tomar rate-limit (429).
 */
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

  // 1. Monta todos os pares de uma vez (evita loops aninhados com await dentro)
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
  const results = await runWithConcurrency(pares, 5, async (par) => {
    // Base local primeiro (instantânea) — garante fallback mesmo sem rede
    const local = findLocalInteraction(par.a, par.b);

    // DDInter com timeout de 4s. Se falhar, `ddinter` fica null e o merge
    // usa o que tiver da base local.
    let ddinter = null;
    try {
      ddinter = await withTimeout(
        fetchDDInterPair(par.a, par.b),
        4000,
        null
      );
    } catch (err) {
      console.warn(`[interactionsService] DDInter falhou: ${par.a} × ${par.b}`, err);
    }

    return mergeInteraction(par.a, par.b, ddinter, local);
  });

  return results;
}

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}