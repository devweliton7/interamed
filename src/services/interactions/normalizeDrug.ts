// src/services/interactions/normalizeDrug.ts

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";

export type NormalizedDrug = {
  originalName: string;
  rxcui: string | null;
  normalizedName: string | null;
};

type RxNormApproximateResponse = {
  approximateGroup?: {
    candidate?: Array<{ rxcui: string; name?: string }>;
  };
};

export async function normalizeDrugName(
  name: string
): Promise<NormalizedDrug> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { originalName: name, rxcui: null, normalizedName: null };
  }

  const url = `${RXNORM_BASE}/Prescribe/rxcui.json?name=${encodeURIComponent(
    trimmed
  )}&search=2`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      return { originalName: name, rxcui: null, normalizedName: null };
    }
    const data: RxNormApproximateResponse = await res.json();
    const first = data?.approximateGroup?.candidate?.[0];
    if (!first?.rxcui) {
      return { originalName: name, rxcui: null, normalizedName: null };
    }
    return {
      originalName: name,
      rxcui: first.rxcui,
      normalizedName: first.name ?? null,
    };
  } catch {
    // timeout, CORS ou rede instável
    return { originalName: name, rxcui: null, normalizedName: null };
  }
}

export async function normalizeDrugList(
  names: string[]
): Promise<NormalizedDrug[]> {
  // RxNorm rate limit: ~2 req/s → sequencial com pequeno delay
  const results: NormalizedDrug[] = [];
  for (const name of names) {
    results.push(await normalizeDrugName(name));
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
}