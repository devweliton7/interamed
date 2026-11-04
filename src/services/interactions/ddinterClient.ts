// src/services/interactions/ddinterClient.ts

const DDINTER_BASE = "https://api.ddinter.com/v1";

export type DDInterInteraction = {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor" | "Unknown";
  description?: string;
  mechanism?: string;
  evidenceLevel?: string;
};

function mapSeverity(raw: string): DDInterInteraction["severity"] {
  const s = raw?.toLowerCase() ?? "";
  if (s.includes("major")) return "Major";
  if (s.includes("moderate")) return "Moderate";
  if (s.includes("minor")) return "Minor";
  return "Unknown";
}

export async function fetchDDInterPair(
  drugA: string,
  drugB: string
): Promise<DDInterInteraction | null> {
  const url = `${DDINTER_BASE}/interaction/check?drug1=${encodeURIComponent(drugA)}&drug2=${encodeURIComponent(drugB)}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[DDInter] HTTP ${res.status} para ${drugA} × ${drugB}`);
      return null;
    }

    const data = await res.json();

    if (!data?.interaction) return null;

    return {
      drugA,
      drugB,
      severity: mapSeverity(data.interaction.level),
      description: data.interaction.description,
      mechanism: data.interaction.mechanism,
      evidenceLevel: data.interaction.evidence,
    };
  } catch (err) {
    console.warn(`[DDInter] Falha na requisição: ${drugA} × ${drugB}`, err);
    return null;
  }
}