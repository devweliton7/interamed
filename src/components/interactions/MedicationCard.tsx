// src/components/interactions/MedicationCard.tsx
import { CheckCircle2, ShieldAlert, ShieldQuestion } from "lucide-react";
import { InteractionCard } from "./InteractionCard";
import type { InteractionResult } from "../../services/interactions/mergeInteractions";

interface MedicationCardProps {
  primaryDrug: string;
  interactions: InteractionResult[];
}

export function MedicationCard({ primaryDrug, interactions }: MedicationCardProps) {
  // Filtra interações que envolvem este medicamento (mantém 'nao_verificada')
  const relatedInteractions = interactions.filter(
    (i) => i.drugA === primaryDrug || i.drugB === primaryDrug
  );

  // Interações que realmente importam (grave/moderada/leve) = têm risco
  const riskInteractions = relatedInteractions.filter(
    (i) => i.severity === "grave" || i.severity === "moderada" || i.severity === "leve"
  );

  // Interações que não puderam ser verificadas (nem grave, nem nada)
  const unverifiedInteractions = relatedInteractions.filter(
    (i) => i.severity === "nao_verificada"
  );

  const hasRisk = riskInteractions.length > 0;
  const hasUnverified = !hasRisk && unverifiedInteractions.length > 0;

  // Estado do header: prioriza risco > não verificado > sem dados
  const headerState: "risk" | "unverified" | "clean" = hasRisk
    ? "risk"
    : hasUnverified
    ? "unverified"
    : "clean";

  return (
    <div className="mb-3 rounded-[28px] bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {headerState === "risk" && (
            <div className="bg-red-50 p-1.5 rounded-full shrink-0">
              <ShieldAlert className="text-red-500 w-5 h-5" strokeWidth={2.5} />
            </div>
          )}
          {headerState === "unverified" && (
            <div className="bg-gray-100 p-1.5 rounded-full shrink-0">
              <ShieldQuestion className="text-gray-500 w-5 h-5" strokeWidth={2.5} />
            </div>
          )}
          {headerState === "clean" && (
            <div className="bg-gray-100 p-1.5 rounded-full shrink-0">
              <CheckCircle2 className="text-gray-400 w-5 h-5" strokeWidth={2.5} />
            </div>
          )}
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
            {primaryDrug}
          </h3>
        </div>

        {headerState === "risk" && (
          <span className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {riskInteractions.length} Risco(s)
          </span>
        )}
        {headerState === "unverified" && (
          <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Não Verificado
          </span>
        )}
        {headerState === "clean" && (
          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sem Dados
          </span>
        )}
      </div>

      <div className="flex flex-col mt-1">
        {headerState === "risk" && (
          <div className="pl-9 mt-2">
            {riskInteractions.map((interaction, idx) => {
              const otherDrug =
                interaction.drugA === primaryDrug ? interaction.drugB : interaction.drugA;
              return (
                <InteractionCard
                  key={`${otherDrug}-${idx}`}
                  item={{ ...interaction, drugB: otherDrug }}
                />
              );
            })}
          </div>
        )}

        {headerState === "unverified" && (
          <div className="pl-9 mt-2">
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
              Não foi possível verificar interações com{" "}
              {unverifiedInteractions.map((i) => (i.drugA === primaryDrug ? i.drugB : i.drugA)).join(", ")}.
              Consulte o farmacêutico antes de administrar.
            </p>
          </div>
        )}

        {headerState === "clean" && (
          <p className="text-[13px] text-gray-400 mt-1.5 pl-9 font-medium">
            Nenhuma interação cadastrada nas bases consultadas. A ausência de dados não garante segurança.
          </p>
        )}
      </div>
    </div>
  );
}