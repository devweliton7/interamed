// src/routes/aprazamento.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ClipboardList, AlertCircle, Clock, CheckCircle2, ShieldAlert, X, Shuffle } from "lucide-react";
import { gerarSugestaoAprazamento } from "../lib/aprazamento";
import { BASE_PACIENTES, type PacienteMock } from "../lib/mockDatabase";

export const Route = createFileRoute("/aprazamento")({
  component: AprazamentoPage,
});

const OPCOES_HORARIO = ["06:00", "07:00", "08:00", "09:00", "10:00", "14:00", "18:00", "19:00", "20:00", "22:00"];

function AprazamentoPage() {
  const navigate = useNavigate();
  
  const [pacienteAtual, setPacienteAtual] = useState<PacienteMock | null>(null);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  
  const [medicamentoEditando, setMedicamentoEditando] = useState<{ id: string; nome: string } | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const simularRecebimento = () => {
    const pacienteSorteado = BASE_PACIENTES[Math.floor(Math.random() * BASE_PACIENTES.length)];
    setPacienteAtual(pacienteSorteado);
    setMedicamentos(pacienteSorteado.medicamentos.map((m, i) => ({ ...m, id: `med-${i}` })));
  };

  const confirmarAlteracao = () => {
    if (!medicamentoEditando || !horarioSelecionado) return;

    setMedicamentos(prev => prev.map(med => {
      if (med.id === medicamentoEditando.id) {
        return { ...med, overrideHoraInicio: horarioSelecionado } as any;
      }
      return med;
    }));

    setToastMessage(`Horário do ${medicamentoEditando.nome} alterado para ${horarioSelecionado}`);
    setMedicamentoEditando(null);
    setHorarioSelecionado(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 safe-area-top safe-area-bottom bg-[#F5F5F7] overflow-x-hidden">
      
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-bold text-center">{toastMessage}</span>
        </div>
      )}

      <header className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate({ to: "/" })} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tighter text-black">Relógio</h1>
        </div>
        
        {pacienteAtual && (
          <button 
            onClick={simularRecebimento}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-full font-bold text-xs hover:bg-blue-100 transition-colors min-h-[44px]"
          >
            <Shuffle size={14} /> Trocar
          </button>
        )}
      </header>

      {!pacienteAtual ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-10 animate-in fade-in">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 w-full">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Integração</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Simule a chegada de uma prescrição.
            </p>
            <button 
              onClick={simularRecebimento}
              className="w-full bg-black text-white font-bold py-4 rounded-full shadow-lg hover:bg-gray-800 transition-all min-h-[56px]"
            >
              Simular Recebimento
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-500 pb-12">
          
          <div className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paciente</p>
              <h2 className="text-base font-bold text-black line-clamp-1">{pacienteAtual.paciente}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leito</p>
              <span className="bg-gray-100 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap">{pacienteAtual.leito}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 mb-6 flex gap-3 items-start shadow-sm">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-xs font-bold text-amber-900">Ajuste Inteligente</h3>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                Horários calculados para evitar a <strong className="font-bold">passagem de plantão</strong>. Toque para alterar.
              </p>
            </div>
          </div>

          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Linha do Tempo</h3>

          <div className="space-y-3">
            {medicamentos.map((med) => {
              const horaBase = med.overrideHoraInicio 
                ? parseInt(med.overrideHoraInicio.split(':')[0]) 
                : undefined;

              const horarios = gerarSugestaoAprazamento(med.frequenciaHoras, med.nome, med.observacao, horaBase);
              
              return (
                <div key={med.id} className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{med.nome}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">A cada {med.frequenciaHoras}h • {med.via}</p>
                    </div>
                    {med.observacao && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 font-black px-2 py-1 rounded-md uppercase tracking-wider max-w-[80px] text-center leading-tight">
                        {med.observacao}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {horarios.map((h, hIdx) => (
                      <button 
                        key={hIdx} 
                        onClick={() => setMedicamentoEditando({ id: med.id, nome: med.nome })}
                        className={`shrink-0 flex flex-col items-center justify-center p-3 rounded-[16px] border min-w-[75px] transition-all active:scale-95 ${h.alerta ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-[#F5F5F7]'}`}
                      >
                        {h.alerta ? (
                          <Clock size={14} className="text-amber-500 mb-1" />
                        ) : (
                          <CheckCircle2 size={14} className="text-emerald-500 mb-1" />
                        )}
                        <span className="text-base font-black text-gray-900">{h.hora}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {medicamentoEditando && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[32px] p-6 animate-in slide-in-from-bottom-10 safe-area-bottom">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ajustar Horário</p>
                <h3 className="text-xl font-black tracking-tight text-black leading-tight">{medicamentoEditando.nome}</h3>
              </div>
              <button onClick={() => setMedicamentoEditando(null)} className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Escolha o novo horário:</p>
              <div className="flex flex-wrap gap-2">
                {OPCOES_HORARIO.map((hora) => {
                  const isPlantao = hora.startsWith("06") || hora.startsWith("07") || hora.startsWith("08") || hora.startsWith("18") || hora.startsWith("19") || hora.startsWith("20");
                  
                  return (
                    <button
                      key={hora}
                      onClick={() => setHorarioSelecionado(hora)}
                      className={`px-4 py-3 rounded-xl font-bold text-sm border transition-all min-w-[70px] ${
                        horarioSelecionado === hora 
                          ? "bg-black text-white border-black shadow-md scale-105" 
                          : isPlantao 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            </div>

            {horarioSelecionado && (horarioSelecionado.startsWith("06") || horarioSelecionado.startsWith("07") || horarioSelecionado.startsWith("08") || horarioSelecionado.startsWith("18") || horarioSelecionado.startsWith("19") || horarioSelecionado.startsWith("20")) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 flex gap-3 animate-in fade-in">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  <strong>Atenção:</strong> Este horário coincide com a troca de plantão. Pode haver atrasos na administração.
                </p>
              </div>
            )}

            <button 
              onClick={confirmarAlteracao}
              disabled={!horarioSelecionado}
              className="w-full bg-black text-white font-bold py-4 rounded-full shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 min-h-[56px] text-lg"
            >
              <CheckCircle2 size={18} />
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}