// src/components/interactions/InteractionCard.tsx

import type { InteractionResult } from "../../services/interactions/mergeInteractions";
import { InteractionBadge } from "./InteractionBadge";

export function InteractionCard({ item }: { item: InteractionResult }) {
  const sourceLabel =
    item.source === "ddinter"
      ? "DDInter 2.0"
      : item.source === "local"
      ? "Base local curada"
      : "Nenhuma base consultada";

  return (
    <details className="group rounded-2xl border border-gray-200 bg-white p-4 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-900">
          {item.drugA} + {item.drugB}
        </span>
        <InteractionBadge severity={item.severity} />
      </summary>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p>{item.description}</p>
        {item.mechanism && (
          <p>
            <span className="font-medium text-gray-800">Mecanismo: </span>
            {item.mechanism}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Fonte: {sourceLabel} · Confiança: {item.confidence}
          {item.evidenceLevel ? ` · Evidência: ${item.evidenceLevel}` : ""}
        </p>
        <p className="text-xs font-medium text-amber-700">
          Ferramenta de apoio. Confirme sempre com o farmacêutico responsável.
        </p>
      </div>
    </details>
  );
}