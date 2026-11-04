// src/services/interactions/localInteractions.ts
import { getInteraction } from "../../lib/meds";

export type LocalInteraction = {
  drugA: string;
  drugB: string;
  severity: "grave" | "moderada" | "leve" | "sem_interacao" | "nao_verificada";
  description: string;
  recommendation?: string;
};

export function findLocalInteraction(drugA: string, drugB: string): LocalInteraction | null {
  const result = getInteraction(drugA, drugB);
  
  let mappedSeverity: LocalInteraction["severity"] = "sem_interacao";
  if (result.severity === "semdado") mappedSeverity = "nao_verificada";
  else if (result.severity === "nenhuma") mappedSeverity = "sem_interacao";
  else mappedSeverity = result.severity as "grave" | "moderada" | "leve";

  return {
    drugA,
    drugB,
    severity: mappedSeverity,
    description: result.desc,
    recommendation: result.rec,
  };
}