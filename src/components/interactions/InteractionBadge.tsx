import type { InteractionSeverity } from "../../services/interactions/mergeInteractions";

const styles: Record<InteractionSeverity, { label: string; className: string }> = {
  grave: { label: "GRAVE", className: "bg-red-100 text-red-800" },
  moderada: { label: "MODERADA", className: "bg-amber-100 text-amber-800" },
  leve: { label: "LEVE", className: "bg-yellow-100 text-yellow-800" },
  sem_interacao: { label: "SEM INTERAÇÃO", className: "bg-emerald-50 text-emerald-700" },
  nao_verificada: { label: "NÃO VERIFICADA", className: "bg-gray-100 text-gray-600" },
};

export function InteractionBadge({ severity }: { severity: InteractionSeverity }) {
  const s = styles[severity];
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${s.className}`}>
      {s.label}
    </span>
  );
}