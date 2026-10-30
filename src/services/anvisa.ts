// src/services/anvisa.ts

export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  LABORATORIO: string;
  REGISTRO: string;
  PRINCIPIO_ATIVO: string;
};

export async function buscarMedicamentosANVISA(nome: string): Promise<MedicamentoANVISA[]> {
  if (!nome || nome.length < 3) return [];

  try {
    const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`);
    
    if (!response.ok) {
      console.warn("API ANVISA retornou erro:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Falha ao buscar na API da ANVISA:", error);
    return [];
  }
}