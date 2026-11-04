// src/services/interactions/interactionsServer.ts
import { createServerFn } from "@tanstack/react-start";
import { checkInteractions } from "./interactionsService";

interface InteractionRequest {
  medicamentos: string[];
}

export const getInteractionsServerFn = createServerFn({ method: "POST" })
  .validator((data: InteractionRequest) => {
    if (!data || !Array.isArray(data.medicamentos)) {
      throw new Error("Payload inválido: esperado um array de medicamentos.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    console.log(`[Server] Recebido pedido de interação para ${data.medicamentos.length} remédios.`);
    
    try {
      const resultado = await checkInteractions(data.medicamentos);
      return { 
        status: "sucesso" as const, 
        interacoes: resultado 
      };
    } catch (error) {
      console.error("[Server] Erro ao verificar interações:", error);
      return { 
        status: "erro" as const, 
        mensagem: "Não foi possível verificar as interações no momento." 
      };
    }
  });