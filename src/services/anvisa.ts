// src/services/anvisa.ts

export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  LABORATORIO: string;
  REGISTRO: string;
  PRINCIPIO_ATIVO: string;
};

// Função pura, sem Server Fn, executada diretamente no navegador
export async function buscarMedicamentosANVISA(nome: string): Promise<MedicamentoANVISA[]> {
  if (!nome || nome.length < 3) return [];

  try {
    const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro no fetch da API ANVISA:", error);
    return [];
  }
}