// src/services/interactions/interactionsService.ts

import { normalizeDrugList } from "./normalizeDrug";
import { fetchDDInterPair } from "./ddinterClient";
import { findLocalInteraction } from "./localInteractions";
import {
  mergeInteraction,
  type InteractionResult,
} from "./mergeInteractions";

export async function checkInteractions(
  drugNames: string[]
): Promise<InteractionResult[]> {
  if (drugNames.length < 2) return [];

  const normalized = await normalizeDrugList(drugNames);
  const results: InteractionResult[] = [];

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const a = normalized[i];
      const b = normalized[j];

      const ddinter = await fetchDDInterPair(a.originalName, b.originalName);
      const local = findLocalInteraction(
        a.originalName,
        b.originalName
      );

      results.push(
        mergeInteraction(a.originalName, b.originalName, ddinter, local)
      );

      // Rate limit DDInter: pequeno delay entre pares
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return results;
}

export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}