// src/services/interactions/interactionsService.ts
import { normalizeDrugList } from "./normalizeDrug";
import { fetchDDInterPair } from "./ddinterClient";
import { findLocalInteraction } from "./localInteractions";
import { mergeInteraction, type InteractionResult } from "./mergeInteractions";

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

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

  console.log(`[Service] Verificando interações para ${drugNames.length} medicamentos.`);
  const normalized = await normalizeDrugList(drugNames);

  const pares: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      pares.push({
        a: normalized[i].originalName,
        b: normalized[j].originalName,
      });
    }
  }

  console.log(`[Service] ${pares.length} pares gerados para verificação.`);

  const results = await runWithConcurrency(pares, 5, async (par) => {
    const local = findLocalInteraction(par.a, par.b);
    let ddinter = null;

    try {
      ddinter = await withTimeout(fetchDDInterPair(par.a, par.b), 4000, null);
      if (ddinter) {
        console.log(`[API ✅] ${par.a} × ${par.b} → ${ddinter.severity}`);
      } else {
        console.log(`[API ❌] ${par.a} × ${par.b} → timeout/sem resposta (usando base local)`);
      }
    } catch (err) {
      console.warn(`[API 💥] Erro na chamada DDInter: ${par.a} × ${par.b}`, err);
    }

    return mergeInteraction(par.a, par.b, ddinter, local);
  });

  console.log(`[Service] Finalizado. Total de resultados: ${results.length}`);
  return results;
}

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}