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
              content: "Você é um assistente de saúde digital. Analise imagens e retorne SEMPRE um objeto JSON válido, sem markdown."
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Analise a imagem.
                  Se for uma receita médica, extraia os medicamentos da coluna de medicamentos.
                  Retorne no formato JSON exato:
                  {
                    "status": "sucesso",
                    "medicamentos": ["Digoxina", "Furosemida"]
                  }
                  
                  Se NÃO for uma receita médica ou se estiver ilegível, retorne:
                  {
                    "status": "erro",
                    "mensagem": "O documento enviado não parece ser uma receita médica legível."
                  }`
                },
                { 
                  type: "image_url", 
                  image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` } 
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        return { status: "erro", mensagem: "A IA não conseguiu processar esta imagem (formato inválido ou muito grande)." };
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      
      return parsed;

    } catch (e) {
      console.error("Erro na Groq:", e);
      return { status: "erro", mensagem: "Falha de conexão com a Inteligência Artificial." };
    }
  });