// src/components/TransparencyNotice.tsx
export function TransparencyNotice() {
  return (
    <div className="mt-6 mb-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
          i
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-900 tracking-tight">
            Protocolo de Dados Clínicos
          </h5>
          <p className="mt-1 text-[11px] text-gray-500 leading-relaxed font-medium">
            O InteraMed não substitui a avaliação clínica. Confirme sempre dosagens, condutas e interações com a equipe médica e farmacêutica responsável.
          </p>
        </div>
      </div>
    </div>
  );
}