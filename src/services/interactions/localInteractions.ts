// src/services/interactions/localInteractions.ts

// Assumindo que meds.ts exporta algo como:
// export const interactions: Array<{
//   drugA: string; drugB: string; severity: string; description: string;
// }>;

import { interactions as rawLocal } from "../../data/meds";

export type LocalInteraction = {
  drugA: string;
  drugB: string;
  severity: "grave" | "moderada" | "leve" | "sem_interacao";
  description: string;
};

export function findLocalInteraction(
  drugA: string,
  drugB: string
): LocalInteraction | null {
  const a = drugA.toLowerCase().trim();
  const b = drugB.toLowerCase().trim();
  const found = rawLocal.find(
    (i) =>
      (i.drugA.toLowerCase() === a && i.drugB.toLowerCase() === b) ||
      (i.drugA.toLowerCase() === b && i.drugB.toLowerCase() === a)
  );
  if (!found) return null;
  return {
    drugA,
    drugB,
    severity: normalizeLocalSeverity(found.severity),
    description: found.description,
  };
}

function normalizeLocalSeverity(
  raw: string
): LocalInteraction["severity"] {
  const s = raw.toLowerCase();
  if (s.includes("grave")) return "grave";
  if (s.includes("moderada")) return "moderada";
  if (s.includes("leve")) return "leve";
  return "sem_interacao";
}