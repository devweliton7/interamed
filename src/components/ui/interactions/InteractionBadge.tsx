// src/components/interactions/InteractionBadge.tsx

import type { InteractionSeverity } from "../../services/interactions/mergeInteractions";

const styles: Record<
  InteractionSeverity,
  { label: string; className: string }
> = {
  grave: {
    label: "Grave",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  moderada: {
    label: "Moderada",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  leve: {
    label: "Leve",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  sem_interacao: {
    label: "Sem interação",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  nao_verificada: {
    label: "Não verificada",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function InteractionBadge({
  severity,
}: {
  severity: InteractionSeverity;
}) {
  const s = styles[severity];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}