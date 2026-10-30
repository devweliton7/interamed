import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronLeft, ChevronDown, Loader2 } from "lucide-react";
import {
  MEDS, getInteraction,
  type Severity
} from "@/lib/meds";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { buscarMedicamentosANVISA } from "../services/anvisa"; // IMPORTANDO A API

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InteraMed — Verificação de interações medicamentosas" },
      { name: "description", content: "Verifique interações entre medicamentos em segundos. Feito para enfermagem." },
    ],
  }),
  component: Index,
});

const DOT: Record<Severity, string> = {
  grave: "bg-sev-grave", moderada: "bg-sev-moderada", leve: "bg-sev-leve",
  nenhuma: "bg-sev-nenhuma", semdado: "bg-sev-semdado",
};
const BAR: Record<Severity, string> = {
  grave: "border-sev-grave", moderada: "border-sev-moderada", leve: "border-sev-leve",
  nenhuma: "border-sev-nenhuma", semdado: "border-sev-semdado",
};
const LABEL: Record<Severity, string> = {
  grave: "Grave", moderada: "Moderada", leve: "Leve", nenhuma: "Sem interação", semdado: "Sem dado",
};
const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type TimeBlock = {
  id: string;
  time: string;
  meds: string[];
};

const CONTEXT_DATA = {
  prescriptionDeliveryTime: "10:00",
  shiftChangeTime: "19:00",
  patientName: "Leito 12"
};

function Index() {
  const [step, setStep] = useState<"search" | "interactions" | "schedule">("search");
  
  // --- PERSISTÊNCIA DE DADOS ---
  const [query, setQuery] = usePersistentState<string>("interamed-query", "");
  const [selected, setSelected] = usePersistentState<string[]>("interamed-selected", []);
  
  // --- ESTADOS DA API ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- ESTADOS NORMAIS ---
  const [hi, setHi] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [online, setOnline] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempHour, setTempHour] = useState("08");
  const [tempMinute, setTempMinute] = useState("00");

  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up();
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);

  // --- NAVEGAÇÃO HOME ---
  const handleHome = () => {
    setStep("search");
    setOpen(null);
  };

  // --- BUSCA INTEGRADA COM A ANVISA (COM DEBOUNCE) ---
  useEffect(() => {
    const q = query.trim();
    
    if (!q) {
      setSuggestions([]);
      return;
    }

    // Busca local imediata (para responder rápido)
    const localResults = MEDS.filter((m) => !selected.includes(m) && strip(m).includes(strip(q)));

    // Se tiver menos de 3 letras, mostra só a busca local para economizar requisições
    if (q.length < 3) {
      setSuggestions(localResults.slice(0, 6));
      return;
    }

    // Debounce de 500ms para a API da ANVISA
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const apiResults = await buscarMedicamentosANVISA(q);
      
      // Formata os nomes para Title Case (ex: "DIPIRONA SODICA" -> "Dipirona Sodica")
      const apiFormatted = apiResults.map(m => {
        const nome = m.PRINCIPIO_ATIVO || m.NOME_PRODUTO;
        return nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      });

      // Combina os resultados locais com os da API, remove duplicatas e limita a 6
      const combined = Array.from(new Set([...localResults, ...apiFormatted]));
      const finalSuggestions = combined.filter(m => !selected.includes(m)).slice(0, 6);
      
      setSuggestions(finalSuggestions);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selected]);

  const add = (m: string) => {
    setSelected((s) => [...s, m]);
    setQuery(""); 
    setHi(0); 
    inputRef.current?.focus();
  };
  
  const remove = (m: string) => setSelected((s) => s.filter((x) => x !== m));

  const verify = () => { 
    setStep("interactions");
    setOpen(null); 
    
    const medsPerBlock = Math.ceil(selected.length / 3);
    const initialBlocks: TimeBlock[] = [
      { id: crypto.randomUUID(), time: "08:00", meds: selected.slice(0, medsPerBlock) },
      { id: crypto.randomUUID(), time: "14:00", meds: selected.slice(medsPerBlock, medsPerBlock * 2) },
      { id: crypto.randomUUID(), time: "20:00", meds: selected.slice(medsPerBlock * 2) },
    ];
    setBlocks(initialBlocks.filter(b => b.meds.length > 0));
  };

  const pairs = useMemo(() => {
    if (step === "search" || selected.length === 0) return [];
    const out: Severity[] = [];
    for (let i = 0; i < selected.length; i++)
      for (let j = i + 1; j < selected.length; j++) out.push(getInteraction(selected[i]!, selected[j]!).severity);
    return out;
  }, [selected, step]);
  
  const count = (s: Severity) => pairs.filter((p) => p === s).length;

  const updateBlockTime = (blockId: string, newTime: string) => {
    setBlocks(prev => {
      const blockToUpdate = prev.find(b => b.id === blockId);
      if (!blockToUpdate) return prev;

      const existingBlock = prev.find(b => b.time === newTime && b.id !== blockId);

      if (existingBlock) {
        const medsFused = Array.from(new Set([...existingBlock.meds, ...blockToUpdate.meds]));
        return prev
          .filter(b => b.id !== blockId)
          .map(b => b.id === existingBlock.id ? { ...b, meds: medsFused } : b);
      } else {
        return prev.map(b => b.id === blockId ? { ...b, time: newTime } : b);
      }
    });
    setEditingBlockId(null);
  };

  const addBlock = () => {
    const defaultTimes = ["10:00", "16:00", "22:00", "06:00", "12:00", "18:00", "00:00"];
    const existingTimes = new Set(blocks.map(b => b.time));
    const nextTime = defaultTimes.find(t => !existingTimes.has(t)) || "12:00";
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), time: nextTime, meds: [] }]);
  };

  const removeBlock = (blockId: string) => {
    const blockToRemove = blocks.find(b => b.id === blockId);
    if (!blockToRemove) return;
    
    setBlocks(prev => {
      const remaining = prev.filter(b => b.id !== blockId);
      if (blockToRemove.meds.length > 0) {
        if (remaining.length === 0) {
           return [{ id: crypto.randomUUID(), time: "10:00", meds: blockToRemove.meds }];
        }
        const newRemaining = [...remaining];
        newRemaining[0].meds = Array.from(new Set([...newRemaining[0].meds, ...blockToRemove.meds]));
        return newRemaining;
      }
      return remaining;
    });
  };

  const moveMed = (medName: string, targetBlockId: string) => {
    setBlocks(prev => {
      const cleaned = prev.map(b => ({ ...b, meds: b.meds.filter(m => m !== medName) }));
      return cleaned.map(b => b.id === targetBlockId ? { ...b, meds: [...b.meds, medName] } : b);
    });
  };

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => {
      const [hA, mA] = a.time.split(":").map(Number);
      const [hB, mB] = b.time.split(":").map(Number);
      return (hA! * 60 + mA!) - (hB! * 60 + mB!);
    });
  }, [blocks]);

  const uniqueTimelineTimes = useMemo(() => {
    const times = new Set(sortedBlocks.map(b => b.time));
    return Array.from(times).sort((a, b) => {
      const [hA, mA] = a.split(":").map(Number);
      const [hB, mB] = b.split(":").map(Number);
      return (hA! * 60 + mA!) - (hB! * 60 + mB!);
    });
  }, [sortedBlocks]);

  const openEditModal = (blockId: string, currentTime: string) => {
    const [h, m] = currentTime.split(":");
    setTempHour(h || "08");
    setTempMinute(m || "00");
    setEditingBlockId(blockId);
  };

  const adjustTime = (type: 'hour' | 'minute', increment: boolean) => {
    if (type === 'hour') {
      let h = parseInt(tempHour, 10);
      h = increment ? (h + 1) % 24 : (h - 1 + 24) % 24;
      setTempHour(h.toString().padStart(2, "0"));
    } else {
      let m = parseInt(tempMinute, 10);
      m = increment ? (m + 5) % 60 : (m - 5 + 60) % 60;
      setTempMinute(m.toString().padStart(2, "0"));
    }
  };

  const handleConfirmTime = () => {
    if (!editingBlockId) return;
    const newTime = `${tempHour.padStart(2, "0")}:${tempMinute.padStart(2, "0")}`;
    updateBlockTime(editingBlockId, newTime);
  };

  const EditTimeAlert = () => {
    if (!editingBlockId) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4 transition-opacity backdrop-blur-md">
        <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white/90 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-6 pt-2 pb-6 overflow-y-auto custom-scrollbar flex-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-black">Atenção</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed font-medium">
              Prescrição válida por <strong className="text-black">24 horas</strong>. Alterar este horário afeta todos os medicamentos do bloco.
            </p>

            <div className="mt-5 bg-[#F2F2F7] p-5 rounded-3xl space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Entrega</span>
                <p className="text-base font-bold text-black mt-0.5">{CONTEXT_DATA.prescriptionDeliveryTime} <span className="font-medium text-gray-400 text-sm">(Válida 24h)</span></p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">Troca de Plantão</span>
                <p className="text-base font-bold text-red-600 mt-0.5">{CONTEXT_DATA.shiftChangeTime}</p>
                <p className="text-xs text-red-500 mt-1 font-semibold">Evite 30 min antes ou depois.</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Sugestão</span>
                <p className="text-base font-bold text-black mt-0.5">1h a 2h após entrega.</p>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-sm font-bold text-black">Novo horário do bloco:</label>
              
              <div className="mt-3 flex items-center justify-center gap-6 h-[200px]">
                <div className="flex flex-col items-center h-full justify-between py-2">
                  <button onClick={() => adjustTime('hour', true)} className="w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors"><span className="text-xl">▲</span></button>
                  <div className="w-20 h-20 flex items-center justify-center">
                    <span className="text-5xl font-extrabold tabular-nums tracking-tighter">{tempHour}</span>
                  </div>
                  <button onClick={() => adjustTime('hour', false)} className="w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors"><span className="text-xl">▼</span></button>
                </div>

                <span className="text-4xl font-extrabold text-gray-300 pb-2">:</span>

                <div className="flex flex-col items-center h-full justify-between py-2">
                  <button onClick={() => adjustTime('minute', true)} className="w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors"><span className="text-xl">▲</span></button>
                  <div className="w-20 h-20 flex items-center justify-center">
                    <span className="text-5xl font-extrabold tabular-nums tracking-tighter">{tempMinute}</span>
                  </div>
                  <button onClick={() => adjustTime('minute', false)} className="w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors"><span className="text-xl">▼</span></button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-white/50 rounded-b-[32px] flex gap-3 shrink-0">
            <button 
              onClick={() => setEditingBlockId(null)}
              className="w-[40%] py-4 rounded-full bg-[#E5E5EA] text-black font-bold text-sm active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmTime}
              className="w-[60%] py-4 rounded-full bg-black text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-black/20"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 bg-[#F9F9F9] overflow-x-hidden">
      
      <header className="mb-8 flex justify-between items-center">
        <h1 
          onClick={handleHome}
          className="text-4xl font-extrabold tracking-tighter text-black cursor-pointer select-none active:opacity-50 transition-opacity"
          title="Voltar ao início"
        >
          InteraMed
        </h1>
        
        {step !== "search" && (
          <button 
            onClick={() => setStep("search")} 
            className="flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Editar lista
          </button>
        )}
      </header>

      <main className="flex-1 w-full">
        
        {step === "search" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHi(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, suggestions.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
                  if (e.key === "Enter" && suggestions[hi]) add(suggestions[hi]);
                  if (e.key === "Backspace" && !query && selected.length) remove(selected[selected.length - 1]!);
                }}
                placeholder="Buscar medicamento..."
                className="w-full rounded-2xl bg-white px-6 py-5 pr-14 text-xl font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-black placeholder:text-gray-400"
              />
              
              {/* Ícone de Carregamento na Barra de Busca */}
              {isSearching && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
                  {suggestions.map((m, i) => (
                    <li key={m}>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); add(m); }}
                        onMouseEnter={() => setHi(i)}
                        className={`w-full px-6 py-4 text-left text-lg font-medium ${i === hi ? "bg-gray-100" : ""}`}
                      >{m}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selected.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {selected.map((m) => (
                  <span key={m} className="inline-flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-3 text-base font-semibold shadow-sm">
                    {m}
                    <button onClick={() => remove(m)} className="rounded-full w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors">X</button>
                  </span>
                ))}
              </div>
            )}

            {selected.length >= 2 && (
              <button onClick={verify}
                className="mt-10 w-full rounded-full bg-black px-8 py-5 text-lg font-bold text-white transition active:scale-[0.98] shadow-xl shadow-black/10">
                Verificar Interações
              </button>
            )}
          </div>
        )}

        {step === "interactions" && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-extrabold tracking-tight text-black">
              {count("grave") + count("moderada") + count("leve") === 0
                ? "Nenhuma interação"
                : [
                    count("grave") && `${count("grave")} graves`,
                    count("moderada") && `${count("moderada")} moderadas`,
                    count("leve") && `${count("leve")} leves`,
                  ].filter(Boolean).join(", ")}
            </h2>
            <p className="mt-1 text-gray-500 font-medium">
              {selected.length} medicamentos verificados
            </p>

            <div className="mt-8 space-y-4">
              {selected.map((m) => {
                const others = selected.filter((o) => o !== m).map((o) => ({ o, ...getInteraction(m, o) }));
                const hits = others.filter((x) => x.severity !== "nenhuma");
                const none = others.filter((x) => x.severity === "nenhuma");
                const isOpen = open === m;
                
                if (hits.length === 0 && none.length > 0) return null;

                return (
                  <div key={m} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <button onClick={() => setOpen(isOpen ? null : m)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors">
                      <span className="text-lg font-bold">{m}</span>
                      <span className="flex gap-1.5 shrink-0">
                        {others.map((x) => (
                          <span key={x.o} className={`h-3 w-3 rounded-full ${DOT[x.severity]}`} />
                        ))}
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-3">
                          {hits.map((x) => (
                            <div key={x.o} className={`border-l-4 ${BAR[x.severity]} bg-[#F9F9F9] py-3 pl-4 pr-3 rounded-r-xl`}>
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="font-bold break-words">{x.o}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${x.severity === 'grave' ? 'text-sev-grave' : 'text-gray-500'}`}>{LABEL[x.severity]}</span>
                              </div>
                              <p className="mt-1 text-sm font-medium">{x.desc}</p>
                              <p className="mt-1 text-xs text-gray-500">{x.rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex justify-center pb-8">
              <button 
                onClick={() => setStep("schedule")}
                className="flex items-center gap-2.5 rounded-full bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-black shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Clock size={18} strokeWidth={2.5} className="text-black" />
                Gerenciar Horários
              </button>
            </div>
          </section>
        )}

        {step === "schedule" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-300 pb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-black">Horários</h2>
              <button onClick={() => setStep("interactions")} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black shrink-0">
                ✕
              </button>
            </div>

            <div className="mb-8 p-5 rounded-3xl bg-white shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Paciente</span>
                  <p className="text-lg font-bold">{CONTEXT_DATA.patientName}</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm bg-[#F9F9F9] p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Entrega</span>
                  <span className="font-semibold text-black">{CONTEXT_DATA.prescriptionDeliveryTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sev-grave block">Troca Plantão</span>
                  <span className="font-semibold text-sev-grave">{CONTEXT_DATA.shiftChangeTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center overflow-x-auto pb-6 mb-2 snap-x gap-1 custom-scrollbar">
              {uniqueTimelineTimes.map((time, i) => (
                <div key={time} className="flex shrink-0 items-center snap-center">
                  {i > 0 && <span className="h-px w-6 bg-gray-300" />}
                  <div className="flex flex-col items-center gap-2 px-1">
                    <span className="h-3 w-3 rounded-full bg-black shadow-sm" />
                    <span className="text-xs font-bold text-gray-600">{time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 w-full">
              {sortedBlocks.map(block => (
                <div key={block.id} className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 w-full max-w-full overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => openEditModal(block.id, block.time)}
                        className="text-3xl font-extrabold tracking-tighter hover:text-gray-600 transition-colors shrink-0"
                      >
                        {block.time}
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-[#F2F2F7] px-2.5 py-1 rounded-md shrink-0">
                        {block.meds.length} MEDS
                      </span>
                    </div>
                    <button 
                      onClick={() => removeBlock(block.id)}
                      className="text-xs font-semibold text-gray-400 hover:text-sev-grave transition-colors shrink-0"
                    >
                      Remover
                    </button>
                  </div>

                  <details className="group w-full">
                    <summary className="flex items-center justify-between w-full py-3 cursor-pointer list-none text-gray-600 hover:text-black transition-colors select-none">
                      <span className="text-sm font-medium">Ver medicamentos</span>
                      <ChevronDown size={18} strokeWidth={2.5} className="text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    
                    <div className="mt-1 space-y-2 pb-2 w-full">
                      {block.meds.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Nenhum medicamento.</p>
                      ) : (
                        block.meds.map(med => {
                          const hasIntraBlockInteraction = block.meds.some(other => 
                            other !== med && getInteraction(med, other).severity === "grave"
                          );
                          return (
                            <div key={med} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl w-full ${hasIntraBlockInteraction ? 'bg-red-50' : 'bg-[#F9F9F9]'}`}>
                              <span className={`text-sm font-semibold break-words max-w-full ${hasIntraBlockInteraction ? 'text-red-700' : 'text-gray-800'}`}>
                                {med}
                              </span>
                              
                              {sortedBlocks.length > 1 && (
                                <select 
                                  value={block.id}
                                  onChange={(e) => moveMed(med, e.target.value)}
                                  className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-gray-500 outline-none cursor-pointer shrink-0 w-full sm:w-auto"
                                >
                                  {sortedBlocks.map(b => (
                                    <option key={b.id} value={b.id} disabled={b.id === block.id}>
                                      Mover p/ {b.time}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </details>

                </div>
              ))}
            </div>
            
            <button onClick={addBlock} className="mt-6 w-full py-4 rounded-full border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Adicionar Horário
            </button>
          </section>
        )}

      </main>

      <footer className="mt-8 text-center text-xs font-medium text-gray-400">
        Ferramenta de apoio. Sempre confirme com o farmacêutico.
      </footer>

      <EditTimeAlert />
    </div>
  );
}