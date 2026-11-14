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
              content: `Você é um OCR de receitas médicas. Sua tarefa é ler a imagem INTEIRA, de cima para baixo, e retornar os medicamentos. 
Você NÃO TRADUZ para inglês. 
Se ler "Cloridrato de Amiodarona", retorne "Amiodarona". 
Se ler "Dipirona Sódica", retorne "Dipirona". 
Se ler "Dipirona", retorne "Dipirona".
Retorne o JSON: { "medicamentos": ["...", "..."] }`
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Leia TODOS os itens da lista de prescrição, do primeiro ao último. Extraia o princípio ativo (sem sais). Não traduza para inglês."
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