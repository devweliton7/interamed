// src/components/interactions/MedicationCard.tsx
import { InteractionCard } from "./InteractionCard";
import type { InteractionResult } from "../../services/interactions/mergeInteractions";

interface MedicationCardProps {
  primaryDrug: string;
  interactions: InteractionResult[];
}

export function MedicationCard({ primaryDrug, interactions }: MedicationCardProps) {
  const relatedInteractions = interactions.filter(
    (i) => i.drugA === primaryDrug || i.drugB === primaryDrug
  );

  return (
    <div className="mb-4 rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {primaryDrug}
        </h3>
        {relatedInteractions.length > 0 && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            {relatedInteractions.length} Alerta(s)
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        {relatedInteractions.length > 0 ? (
          relatedInteractions.map((interaction, idx) => {
            const otherDrug = interaction.drugA === primaryDrug ? interaction.drugB : interaction.drugA;
            return (
              <InteractionCard 
                key={`${otherDrug}-${idx}`} 
                item={{ ...interaction, drugB: otherDrug }} 
              />
            );
          })
        ) : (
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Nenhuma interação grave identificada nas bases para este medicamento.
          </p>
        )}
      </div>
    </div>
  );
}