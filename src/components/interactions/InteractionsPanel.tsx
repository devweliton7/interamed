// src/components/interactions/InteractionsPanel.tsx
import { useInteractions } from "../../hooks/useInteractions";
import { InteractionCard } from "./InteractionCard";
import { Loader2 } from "lucide-react";

export function InteractionsPanel({ selectedDrugs }: { selectedDrugs: string[] }) {
  const { interactionsData, loadingInteractions, error } = useInteractions(selectedDrugs);

  if (selectedDrugs.length < 2) {
    return (
      <p className="text-sm text-gray-500">
        Selecione pelo menos 2 medicamentos para verificar interações.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Interações medicamentosas
        </h2>
      </div>

      {loadingInteractions && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Consultando bases de interação…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error.message || "Erro ao carregar interações."}
        </div>
      )}

      {interactionsData && interactionsData.length > 0 && (
        <div className="space-y-3">
          {interactionsData.map((item, idx) => (
            <InteractionCard key={`${item.drugA}-${item.drugB}-${idx}`} item={item} />
          ))}
        </div>
      )}

      {interactionsData && interactionsData.length === 0 && !loadingInteractions && (
        <p className="text-sm text-gray-500">
          Nenhum par de medicamentos para verificar.
        </p>
      )}
    </section>
  );
}