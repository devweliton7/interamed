// src/services/interactions/interactionsService.ts
import { fetchDDInterPair } from "./ddinterClient";
import { checkLocalInteractions } from "./localInteractions";
import { mergeInteraction, type InteractionResult } from "./mergeInteractions";

/**
 * Verifica interação entre DOIS fármacos.
 * Cadeia: Local -> OpenFDA -> mergeInteractions (fallback = nao_verificada).
 */
export async function checkInteraction(drugA: string, drugB: string): Promise<InteractionResult> {
  const local = checkLocalInteractions(drugA, drugB);

  if (local) {
    return mergeInteraction(drugA, drugB, null, local);
  }

  const fda = await fetchDDInterPair(drugA, drugB);
  return mergeInteraction(drugA, drugB, fda, null);
}

/**
 * Verifica interação entre TODOS os pares de uma lista de medicamentos.
 * Usado pelo interactionsServer.ts (que recebe um array de remédios).
 */
export async function checkInteractions(meds: string[]): Promise<InteractionResult[]> {
  if (!Array.isArray(meds) || meds.length < 2) return [];

  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < meds.length; i++) {
    for (let j = i + 1; j < meds.length; j++) {
      pairs.push([meds[i]!, meds[j]!]);
    }
  }

  const results = await Promise.all(
    pairs.map(([a, b]) => checkInteraction(a, b))
  );

  return results;
}

/** Utilitário legado (n escolhe 2) mantido para os testes antigos. */
export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}