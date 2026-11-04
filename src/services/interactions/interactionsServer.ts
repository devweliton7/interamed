// src/services/interactions/interactionsServer.ts
import { createServerFn } from "@tanstack/react-start";
// 🔑 ESSENCIAL: Importar a função para o build do Nitro não removê-la
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
    try {
      const resultado = await checkInteractions(data.medicamentos);
      return { status: "sucesso", interacoes: resultado };
    } catch (error) {
      console.error("[ServerFn] Erro ao verificar interações:", error);
      return { 
        status: "erro", 
        mensagem: "Não foi possível verificar as interações no momento." 
      };
    }
  });