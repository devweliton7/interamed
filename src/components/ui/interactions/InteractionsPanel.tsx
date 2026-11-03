// src/components/InteractionsPanel.tsx

import { useInteractions } from "../hooks/useInteractions";
import { InteractionCard } from "./interactions/InteractionCard";
import { InteractionBadge } from "./interactions/InteractionBadge";

export function InteractionsPanel({ selectedDrugs }: { selectedDrugs: string[] }) {
  const { data, loading, error, refetch } = useInteractions(selectedDrugs);

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
        <button
          onClick={refetch}
          className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Atualizar
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Consultando bases de interação…</p>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, idx) => (
            <InteractionCard key={`${item.drugA}-${item.drugB}-${idx}`} item={item} />
          ))}
        </div>
      )}

      {data && data.length === 0 && !loading && (
        <p className="text-sm text-gray-500">
          Nenhum par de medicamentos para verificar.
        </p>
      )}
    </section>
  );
}