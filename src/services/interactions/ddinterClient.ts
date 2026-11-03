// src/services/interactions/ddinterClient.ts

const DDINTER_BASE = "https://ddinter.scbdd.com/api";

export type DDInterInteraction = {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor" | "Unknown";
  description?: string;
  mechanism?: string;
  evidenceLevel?: string;
};

type DDInterRawResponse = {
  // A API real pode variar; o adapter abaixo normaliza os campos.
  interactions?: Array<{
    drug1: string;
    drug2: string;
    level: string;
    description?: string;
    mechanism?: string;
    evidence?: string;
  }>;
};

function mapSeverity(raw: string): DDInterInteraction["severity"] {
  const s = raw?.toLowerCase() ?? "";
  if (s.includes("major") || s.includes("grave")) return "Major";
  if (s.includes("moderate") || s.includes("moderada")) return "Moderate";
  if (s.includes("minor") || s.includes("leve")) return "Minor";
  return "Unknown";
}

export async function fetchDDInterPair(
  drugA: string,
  drugB: string
): Promise<DDInterInteraction | null> {
  const url = `${DDINTER_BASE}/interaction?drug1=${encodeURIComponent(
    drugA
  )}&drug2=${encodeURIComponent(drugB)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data: DDInterRawResponse = await res.json();
    const item = data?.interactions?.[0];
    if (!item) return null;
    return {
      drugA,
      drugB,
      severity: mapSeverity(item.level),
      description: item.description,
      mechanism: item.mechanism,
      evidenceLevel: item.evidence,
    };
  } catch {
    return null;
  }
}