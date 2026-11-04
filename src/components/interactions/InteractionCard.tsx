// src/components/interactions/InteractionCard.tsx
import type { InteractionResult } from "../../services/interactions/mergeInteractions";
import { InteractionBadge } from "./InteractionBadge";

export function InteractionCard({ item }: { item: InteractionResult }) {
  const severityStyles = {
    grave: { border: "border-l-red-600", bg: "bg-red-50/40" },
    moderada: { border: "border-l-amber-500", bg: "bg-amber-50/40" },
    leve: { border: "border-l-yellow-400", bg: "bg-yellow-50/30" },
    sem_interacao: { border: "border-l-emerald-500", bg: "bg-white" },
    nao_verificada: { border: "border-l-gray-300", bg: "bg-white" },
  };
  const style = severityStyles[item.severity];

  return (
    <div className={`relative mt-3 overflow-hidden rounded-[20px] border border-gray-100 border-l-4 ${style.border} ${style.bg} p-4 shadow-sm transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-gray-900 tracking-tight break-words">{item.drugB}</h4>
        <InteractionBadge severity={item.severity} />
      </div>
      <p className="mt-2 text-xs text-gray-700 leading-relaxed font-medium">{item.description}</p>
      
      {item.recommendation && (
        <div className="mt-3 pt-2.5 border-t border-gray-200/60">
          <p className="text-[11px] text-gray-600"><span className="font-bold text-gray-900">Conduta: </span>{item.recommendation}</p>
        </div>
      )}
      <p className="mt-2.5 text-[9px] text-gray-400 font-bold uppercase tracking-wide">
        Fonte: {item.source === "ddinter" ? "Base Internacional DDInter" : "Base Local ANVISA"}
      </p>
    </div>
  );
}