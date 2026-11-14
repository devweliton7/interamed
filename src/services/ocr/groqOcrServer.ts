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
              content: `Você é um sistema de OCR de receitas médicas brasileiro. 
Sua única função é transcrever o texto da imagem para JSON.
Você NÃO É UM TRADUTOR. Você NÃO É UM MÉDICO. Você NÃO DEVE TRADUZIR NADA.

DICIONÁRIO DE PROIBIÇÃO (NUNCA USE ESTES TERMOS):
- NUNCA retorne "dipyrone". Use sempre "Dipirona".
- NUNCA retorne "aspirin". Use sempre "AAS" ou "Ácido Acetilsalicílico".
- NUNCA retorne termos em inglês.

REGRAS DE EXTRAÇÃO:
1. Se a imagem tiver "Cloridrato de Amiodarona", retorne "Amiodarona".
2. Se a imagem tiver "Dipirona Sódica", retorne "Dipirona".
3. Se for um nome que não está no dicionário, retorne EXATAMENTE como está escrito na imagem, em português.
4. Ignore datas, assinaturas, dosagens (mg) e posologias.
5. Retorne APENAS JSON no formato: { "status": "sucesso", "medicamentos": ["Nome1", "Nome2"] }`
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Transcreva os medicamentos desta imagem para JSON. Lembre-se: PROIBIDO TRADUZIR. Se ler Dipirona, escreva Dipirona."
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