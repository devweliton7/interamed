// src/services/interactions/localInteractions.ts
import { getInteraction, type Severity } from "../../lib/meds";

export type LocalInteraction = {
  severity: Exclude<Severity, "nenhuma" | "semdado">;
  description: string;
  recommendation: string;
  source: string;
};

export function checkLocalInteractions(drugA: string, drugB: string): LocalInteraction | null {
  const result = getInteraction(drugA, drugB);

  if (result.severity === "semdado" || result.severity === "nenhuma") {
    return null;
  }

  return {
    severity: result.severity,
    description: result.desc,
    recommendation: result.rec,
    source: result.source ?? "Base Local ISMP/FDA",
  };
}