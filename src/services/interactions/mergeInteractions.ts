// src/services/interactions/mergeInteractions.ts

import type { DDInterInteraction } from "./ddinterClient";
import type { LocalInteraction } from "./localInteractions";

export type InteractionSeverity =
  | "grave"
  | "moderada"
  | "leve"
  | "sem_interacao"
  | "nao_verificada";

export type InteractionResult = {
  drugA: string;
  drugB: string;
  severity: InteractionSeverity;
  description: string;
  source: "ddinter" | "local" | "nenhuma";
  confidence: "alta" | "media" | "baixa";
  mechanism?: string;
  evidenceLevel?: string;
};

export function mergeInteraction(
  drugA: string,
  drugB: string,
  ddinter: DDInterInteraction | null,
  local: LocalInteraction | null
): InteractionResult {
  if (ddinter && ddinter.severity !== "Unknown") {
    return {
      drugA,
      drugB,
      severity: mapDDInterSeverity(ddinter.severity),
      description: ddinter.description ?? "Interação identificada no DDInter.",
      source: "ddinter",
      confidence: ddinter.evidenceLevel ? "alta" : "media",
      mechanism: ddinter.mechanism,
      evidenceLevel: ddinter.evidenceLevel,
    };
  }

  if (local) {
    return {
      drugA,
      drugB,
      severity: local.severity,
      description: local.description,
      source: "local",
      confidence: "media",
    };
  }

  return {
    drugA,
    drugB,
    severity: "nao_verificada",
    description:
      "Nenhuma interação conhecida nas bases consultadas. Isso não garante ausência de risco.",
    source: "nenhuma",
    confidence: "baixa",
  };
}

function mapDDInterSeverity(
  s: DDInterInteraction["severity"]
): InteractionSeverity {
  if (s === "Major") return "grave";
  if (s === "Moderate") return "moderada";
  if (s === "Minor") return "leve";
  return "nao_verificada";
}