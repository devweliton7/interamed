// src/components/interactions/MedicationCard.tsx
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { InteractionCard } from "./InteractionCard";
import type { InteractionResult } from "../../services/interactions/mergeInteractions";

interface MedicationCardProps {
  primaryDrug: string;
  interactions: InteractionResult[];
}

export function MedicationCard({ primaryDrug, interactions }: MedicationCardProps) {
  // Filtra apenas as interações que realmente importam (ignora 'sem_interacao' e 'nao_verificada')
  const relevantInteractions = interactions.filter(
    (i) => (i.drugA === primaryDrug || i.drugB === primaryDrug) && 
           i.severity !== "sem_interacao" && 
           i.severity !== "nao_verificada"
  );

  const hasWarnings = relevantInteractions.length > 0;

  return (
    <div className="mb-3 rounded-[28px] bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasWarnings ? (
            <div className="bg-red-50 p-1.5 rounded-full shrink-0">
              <ShieldAlert className="text-red-500 w-5 h-5" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="bg-emerald-50 p-1.5 rounded-full shrink-0">
              <CheckCircle2 className="text-emerald-500 w-5 h-5" strokeWidth={2.5} />
            </div>
          )}
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
            {primaryDrug}
          </h3>
        </div>
        
        {hasWarnings ? (
          <span className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {relevantInteractions.length} Risco(s)
          </span>
        ) : (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full">
            Seguro
          </span>
        )}
      </div>
      
      <div className="flex flex-col mt-1">
        {hasWarnings ? (
          <div className="pl-9 mt-2">
            {relevantInteractions.map((interaction, idx) => {
              const otherDrug = interaction.drugA === primaryDrug ? interaction.drugB : interaction.drugA;
              return (
                <InteractionCard 
                  key={`${otherDrug}-${idx}`} 
                  item={{ ...interaction, drugB: otherDrug }} 
                />
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400 mt-1.5 pl-9 font-medium">
            Nenhuma interação grave identificada.
          </p>
        )}
      </div>
    </div>
  );
}