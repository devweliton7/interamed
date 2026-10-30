// src/services/anvisa.ts
export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  PRINCIPIO_ATIVO: string;
};

export async function buscarMedicamentosANVISA(nome: string): Promise<MedicamentoANVISA[]> {
  if (!nome || nome.length < 3) return [];

  try {
    const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro no fetch da API:", error);
    return [];
  }
}