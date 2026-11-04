// src/api/interactions.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkInteractions } from "../services/interactions/interactionsService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { drugs } = req.body ?? {};
  if (!Array.isArray(drugs) || drugs.length < 2) {
    return res
      .status(400)
      .json({ error: "Envie um array 'drugs' com pelo menos 2 itens." });
  }

  try {
    const interactions = await checkInteractions(drugs);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ interactions });
  } catch (err) {
    console.error("Erro ao checar interações:", err);
    return res.status(500).json({ error: "Falha ao consultar interações." });
  }
}