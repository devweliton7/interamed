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
              content: "Você é um farmacêutico clínico brasileiro. Sua função é ler a imagem e retornar APENAS os princípios ativos dos medicamentos. Você NUNCA traduz nomes para o inglês. Você mantém os nomes exatamente em Português do Brasil, removendo apenas sais (ex: Cloridrato, Sódica) e marcas."
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Transcreva os medicamentos da imagem.

                  REGRAS ESTRITAS (VIOLAR É ERRO CRÍTICO):
                  1. Extraia APENAS o nome do princípio ativo em PORTUGUÊS.
                  2. NUNCA TRADUZA para o inglês (Ex: Não traduza "Dipirona" para "Dipyrone").
                  3. REMOVA SAIS: "Cloridrato de Amiodarona" -> "Amiodarona"; "Dipirona Sódica" -> "Dipirona".
                  4. REMOVA MARCAS: "Tylenol" -> "Paracetamol".
                  5. IGNORE: Assinaturas, datas, CPFs, dosagens (mg), posologias (1 comprimido).
                  6. Se você ler "Cloridrato de Amiodarona", retorne "Amiodarona". Não invente.
                  
                  Retorne APENAS neste formato JSON:
                  { "status": "sucesso", "medicamentos": ["Nome1", "Nome2"] }`
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