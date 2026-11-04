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
            content: "Você é um especialista em leitura de receitas médicas. Sua única função é extrair os nomes dos medicamentos."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Esta imagem é uma receita médica em formato de tabela. Ignore as colunas de data, paciente, posologia e quantidade. Liste APENAS os medicamentos que estão na coluna 'MEDICAMENTO / CONCENTRAÇÃO'. Retorne um por linha, sem numeração, sem dosagens e sem textos extras." 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` } 
              },
            ],
          },
        ],
        temperature: 0.1, // Quase zero para não inventar nada
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha na Groq: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    return { texto: json.choices?.[0]?.message?.content || "" };
  });