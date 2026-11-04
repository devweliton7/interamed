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
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada no ambiente.");

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
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Extraia o texto desta receita médica. Retorne apenas os nomes dos medicamentos e suas dosagens, um por linha. Sem comentários." 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` } 
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API da Groq:", errorText);
      throw new Error(`Falha na Groq: ${response.status}`);
    }

    const json = await response.json();
    return { texto: json.choices?.[0]?.message?.content || "" };
  });