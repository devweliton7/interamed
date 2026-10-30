// src/services/anvisa.ts
import { createServerFn } from "@tanstack/react-start";

export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  LABORATORIO: string;
  REGISTRO: string;
  PRINCIPIO_ATIVO: string;
};

export const buscarMedicamentosANVISA = createServerFn({ method: "GET" })
  .validator((nome: string) => nome)
  .handler(async ({ data: nome }) => {
    if (!nome || nome.length < 3) return [];

    // LOG 1: Verificar se a função foi chamada no servidor
    console.log(`[ANVISA Server] Buscando por: "${nome}"`);

    try {
      // Adiciona um timeout de 8 segundos para evitar o limite de 10s da Vercel
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      // LOG 2: Verificar o status da resposta
      console.log(`[ANVISA Server] Status da resposta: ${response.status}`);

      if (!response.ok) {
        console.error(`[ANVISA Server] Erro na API: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      // LOG 3: Verificar quantos itens foram encontrados
      console.log(`[ANVISA Server] Itens encontrados: ${Array.isArray(data) ? data.length : 0}`);

      return Array.isArray(data) ? (data as MedicamentoANVISA[]) : [];
    } catch (error) {
      // LOG 4: Capturar qualquer erro (incluindo timeout e falha de rede)
      console.error("[ANVISA Server] Falha na busca:", error);
      return [];
    }
  });