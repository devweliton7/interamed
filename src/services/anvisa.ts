// src/services/anvisa.ts
import { createServerFn } from "@tanstack/react-start";

export type MedicamentoANVISA = {
  NOME_PRODUTO: string;
  LABORATORIO: string;
  REGISTRO: string;
  PRINCIPIO_ATIVO: string;
};

// Transformamos a busca em uma função que roda no servidor (sem CORS)
export const buscarMedicamentosANVISA = createServerFn({ method: "GET" })
  .validator((nome: string) => nome)
  .handler(async ({ data: nome }) => {
    if (!nome || nome.length < 3) return [];

    try {
      const response = await fetch(`https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`);
      
      if (!response.ok) {
        console.warn("API ANVISA retornou erro:", response.status);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? (data as MedicamentoANVISA[]) : [];
    } catch (error) {
      console.error("Falha ao buscar na API da ANVISA no servidor:", error);
      return [];
    }
  });