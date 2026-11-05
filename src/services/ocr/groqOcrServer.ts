// src/services/ocr/groqOcrServer.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  imageBase64: z.string(),
});

export const extrairTextoComGroq = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY; 
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: "Você é um transcritor de receitas médicas. Sua função é ler a imagem e retornar APENAS os nomes dos medicamentos listados na coluna principal de prescrição. Você deve ser burro e literal: se não for um nome de medicamento, você não transcreve."
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Transcreva a lista de medicamentos da imagem.
                  
                  REGRAS ESTRITAS (VIOLAR É ERRO CRÍTICO):
                  1. Extraia APENAS o nome do princípio ativo/medicamento (ex: "Dipirona").
                  2. IGNORE COMPLETAMENTE: Assinaturas, carimbos, datas, CPFs, nomes de médicos, cabeçalhos de hospital, e rodapés (ex: "Página 1", "Sistema X").
                  3. IGNORE posologias ("1 comprimido", "8/8h"), vias ("VO", "EV") e quantidades.
                  4. Retorne APENAS no formato JSON: 
                  { "status": "sucesso", "medicamentos": ["Nome1", "Nome2"] }
                  
                  Se não for uma receita:
                  { "status": "erro", "mensagem": "Documento inválido." }`
                },
                { 
                  type: "image_url", 
                  image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` } 
                },
              ],
            },
          ],
          temperature: 0.0,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) return { status: "erro", mensagem: "Falha na API." };

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch (e) {
      console.error("Erro na Groq:", e);
      return { status: "erro", mensagem: "Falha de conexão." };
    }
  });