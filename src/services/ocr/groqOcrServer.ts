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
            content: "Você é um extrator de dados de receitas médicas. Você deve retornar APENAS um objeto JSON válido, sem markdown, sem texto antes ou depois."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Extraia TODOS os medicamentos da coluna 'MEDICAMENTO / CONCENTRAÇÃO' desta tabela. Retorne no formato: { \"medicamentos\": [\"Digoxina\", \"Furosemida\", ...] }. Não pule nenhum item. A tabela tem 29 itens." 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` } 
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4000, // Aumentado para garantir que todos os 29 caibam
        response_format: { type: "json_object" } // FORÇA A SAÍDA EM JSON
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha na Groq: ${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(content);
      // Retorna a lista como string separada por quebra de linha para o parser antigo
      return { texto: (parsed.medicamentos || []).join("\n") };
    } catch (e) {
      // Fallback se o JSON falhar
      return { texto: content };
    }
  });