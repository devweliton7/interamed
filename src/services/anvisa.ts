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

    try {
      const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`);
      
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? (data as MedicamentoANVISA[]) : [];
    } catch (error) {
      console.error("[ANVISA Server] Erro:", error);
      return [];
    }
  });