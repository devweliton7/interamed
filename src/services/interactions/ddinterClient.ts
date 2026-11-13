// src/services/interactions/ddinterClient.ts (Usando OpenFDA)

export type DDInterInteraction = {
  drugA: string;
  drugB: string;
  severity: "Major" | "Moderate" | "Minor" | "Unknown";
  description?: string;
  mechanism?: string;
  evidenceLevel?: string;
};

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

export async function fetchDDInterPair(
  drugA: string,
  drugB: string
): Promise<DDInterInteraction | null> {
  try {
    // 1. Busca a bula do remédio A na OpenFDA
    // Buscamos pelo nome genérico (ex: "warfarin") ou nome de marca
    const query = encodeURIComponent(`openfda.generic_name:"${drugA}" OR openfda.brand_name:"${drugA}"`);
    const url = `${OPENFDA_BASE}?search=${query}&limit=1`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const data = await res.json();
    const label = data?.results?.[0];
    
    // Se não achou a bula, não tem como verificar
    if (!label) return null;

    // 2. Pega o texto da seção de interações da bula
    const interactionsArray = label.drug_interactions;
    if (!interactionsArray || interactionsArray.length === 0) return null;

    const interactionsText = interactionsArray.join(" ").toLowerCase();
    const drugBLower = drugB.toLowerCase();

    // 3. Verifica se o remédio B é mencionado no texto da bula do remédio A
    if (interactionsText.includes(drugBLower)) {
      // Extrai um trecho do texto para mostrar na tela
      const index = interactionsText.indexOf(drugBLower);
      const start = Math.max(0, index - 150);
      const end = Math.min(interactionsText.length, index + drugBLower.length + 200);
      const snippet = interactionsArray.join(" ").substring(start, end).trim();

      return {
        drugA,
        drugB,
        // A OpenFDA não classifica gravidade. Usamos "Moderate" como padrão
        // para evitar pânico desnecessário, mas indicando que há uma menção.
        severity: "Moderate", 
        description: `Menção na bula da OpenFDA: "...${snippet}..."`,
        evidenceLevel: "Bula Oficial (OpenFDA)",
      };
    }

    return null;
  } catch (err) {
    console.warn(`[OpenFDA] Erro ao buscar ${drugA} × ${drugB}:`, err);
    return null;
  }
}