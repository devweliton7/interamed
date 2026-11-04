// src/components/interactions/InteractionCard.tsx
import type { InteractionResult } from "../../services/interactions/mergeInteractions";

const severityStyles = {
  grave: { border: "border-l-red-500", bg: "bg-red-50/50", text: "text-red-700", label: "Grave" },
  moderada: { border: "border-l-amber-500", bg: "bg-amber-50/50", text: "text-amber-700", label: "Moderada" },
  leve: { border: "border-l-yellow-400", bg: "bg-yellow-50/50", text: "text-yellow-700", label: "Leve" },
  sem_interacao: { border: "border-l-emerald-500", bg: "bg-white", text: "text-emerald-500", label: "Seguro" },
  nao_verificada: { border: "border-l-gray-300", bg: "bg-white", text: "text-gray-500", label: "Não Verificada" },
} as const;

export function InteractionCard({ item }: { item: InteractionResult }) {
  const style = severityStyles[item.severity] ?? severityStyles.nao_verificada;

  // Não renderiza nada se não for um alerta real
  if (item.severity === "sem_interacao") return null;

  return (
    <div className={`relative mt-2 overflow-hidden rounded-2xl border-l-[3px] ${style.border} ${style.bg} p-3.5 transition-all`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="text-sm font-bold text-gray-900 tracking-tight">
          Interage com: {item.drugB}
        </h4>
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-white/60 ${style.text}`}>
          {style.label}
        </span>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed font-medium mt-1">
        {item.description}
      </p>

      {item.recommendation && (
        <div className="mt-2 text-[11px] text-gray-600">
          <span className="font-bold text-gray-900">Conduta: </span>
          {item.recommendation}
        </div>
      )}
    </div>
  );
}