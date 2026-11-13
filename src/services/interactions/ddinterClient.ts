// src/services/interactions/ddinterClient.ts

export type DDInterInteraction = {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor" | "Unknown";
  description?: string;
  mechanism?: string;
  evidenceLevel?: string;
};

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

async function fetchFdaInteractions(drugA: string, drugB: string): Promise<DDInterInteraction | null> {
  try {
    const query = encodeURIComponent(`openfda.generic_name:"${drugA}" OR openfda.brand_name:"${drugA}"`);
    const url = `${OPENFDA_BASE}?search=${query}&limit=1`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json();
    const label = data?.results?.[0];
    if (!label) return null;

    const interactionsText = (label.drug_interactions || []).join(" ").toLowerCase();
    const drugBLower = drugB.toLowerCase();

    if (interactionsText.includes(drugBLower)) {
      const index = interactionsText.indexOf(drugBLower);
      const start = Math.max(0, index - 150);
      const end = Math.min(interactionsText.length, index + drugBLower.length + 200);
      const snippet = interactionsText.substring(start, end).trim();

      return {
        drugA,
        drugB,
        severity: "Moderate",
        description: `Interação detectada na bula (OpenFDA): "...${snippet}..."`,
        evidenceLevel: "Bula Oficial",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchDDInterPair(
  drugA: string,
  drugB: string
): Promise<DDInterInteraction | null> {
  // 1. Tenta buscar na bula do Remédio A
  const resultA = await fetchFdaInteractions(drugA, drugB);
  if (resultA) return resultA;

  // 2. Se não achou, tenta buscar na bula do Remédio B (Busca Bidirecional)
  const resultB = await fetchFdaInteractions(drugB, drugA);
  if (resultB) {
     return {
        ...resultB,
        drugA,
        drugB,
        description: resultB.description?.replace(drugA, drugB).replace(drugB, drugA)
     };
  }

  return null;
}