// src/services/interactions/normalizeDrug.ts

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";

export type NormalizedDrug = {
  originalName: string;
  rxcui: string | null;
  normalizedName: string | null;
};

export async function normalizeDrugName(name: string): Promise<NormalizedDrug> {
  const trimmed = name.trim();
  if (!trimmed) return { originalName: name, rxcui: null, normalizedName: null };

  try {
    // A RxNorm Approximate Match é ótima para lidar com erros de digitação ou nomes comerciais
    const url = `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(trimmed)}&maxEntries=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!res.ok) throw new Error("Falha na API RxNorm");
    
    const data = await res.json();
    const candidate = data?.approximateGroup?.candidate?.[0];
    
    if (candidate?.rxcui) {
      return {
        originalName: name,
        rxcui: candidate.rxcui,
        normalizedName: candidate.name || trimmed,
      };
    }
  } catch (err) {
    console.warn(`[RxNorm] Falha ao normalizar ${name}`, err);
  }

  // Se falhar, retorna o original
  return { originalName: name, rxcui: null, normalizedName: name };
}

export async function normalizeDrugList(names: string[]): Promise<NormalizedDrug[]> {
  // Roda em paralelo para não demorar, mas com limite de 5 por vez para não sobrecarregar
  const results: NormalizedDrug[] = [];
  const chunks = [];
  
  for (let i = 0; i < names.length; i += 5) {
    chunks.push(names.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(normalizeDrugName));
    results.push(...chunkResults);
  }

  return results;
}