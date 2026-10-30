import { createServerFn } from "@tanstack/react-start";

export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  PRINCIPIO_ATIVO: string;
};

const buscarNoServidor = createServerFn({ method: "GET" })
  .inputValidator((nome: string) => nome)
  .handler(async ({ data: nome }): Promise<MedicamentoANVISA[]> => {
    const url = `https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      console.log("[ANVISA Server]", nome, "status:", res.status);
      if (!res.ok) return [];
      const data = await res.json();
      console.log("[ANVISA Server] itens:", Array.isArray(data) ? data.length : "formato inesperado");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("[ANVISA Server] falhou:", url, error);
      return [];
    }
  });

export async function buscarMedicamentosANVISA(nome: string): Promise<MedicamentoANVISA[]> {
  if (!nome || nome.length < 3) return [];
  try {
    return await buscarNoServidor({ data: nome });
  } catch (error) {
    console.error("Erro na busca:", error);
    return [];
  }
}