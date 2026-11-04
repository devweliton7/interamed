// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronLeft, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { MEDS, getInteraction } from "@/lib/meds";
import { buscarMedicamentosANVISA } from "../services/anvisa";
import { useInteractions } from "../hooks/useInteractions";
import { MedicationCard } from "../components/interactions/MedicationCard";
import { TransparencyNotice } from "../components/TransparencyNotice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InteraMed — Verificação de interações" },
      { name: "description", content: "Verifique interações medicamentosas com precisão." },
    ],
  }),
  component: Index,
});

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type TimeBlock = { id: string; time: string; meds: string[] };

const CONTEXT_DATA = {
  prescriptionDeliveryTime: "10:00",
  shiftChangeTime: "19:00",
  patientName: "Leito 12"
};

function Index() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"search" | "interactions" | "schedule">("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hi, setHi] = useState(0);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempHour, setTempHour] = useState("08");
  const [tempMinute, setTempMinute] = useState("00");

  const { data: interactionsData, loading: loadingInteractions } = useInteractions(selected);

  useEffect(() => {
    setMounted(true);
    try {
      const savedQuery = localStorage.getItem("interamed-query");
      const savedSelected = localStorage.getItem("interamed-selected");
      if (savedQuery) setQuery(JSON.parse(savedQuery));
      if (savedSelected) setSelected(JSON.parse(savedSelected));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("interamed-query", JSON.stringify(query));
  }, [query, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("interamed-selected", JSON.stringify(selected));
  }, [selected, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const q = query.trim();
    if (!q) { setSuggestions([]); return; }

    const localResults = MEDS.filter((m) => !selected.includes(m) && strip(m).includes(strip(q)));
    if (q.length < 3) { setSuggestions(localResults.slice(0, 6)); return; }

    setIsSearching(true);
    const fetchData = async () => {
      try {
        const apiResults = await buscarMedicamentosANVISA(q);
        const apiFormatted = apiResults.map(m => {
          const nome = m.PRINCIPIO_ATIVO || m.NOME_PRODUTO || "";
          return nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        });
        const combined = Array.from(new Set([...localResults, ...apiFormatted]));
        setSuggestions(combined.filter(m => !selected.includes(m)).slice(0, 6));
      } catch (error) {
        console.error("Erro no fetch:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [query, selected, mounted]);

  const add = (m: string) => { 
    if (!selected.includes(m)) setSelected((s) => [...s, m]); 
    setQuery(""); 
    setHi(0); 
    inputRef.current?.focus(); 
  };
  
  const remove = (m: string) => setSelected((s) => s.filter((x) => x !== m));
  const clearAll = () => setSelected([]);

  const verify = () => { 
    setStep("interactions"); 
    const medsPerBlock = Math.ceil(selected.length / 3);
    const initialBlocks: TimeBlock[] = [
      { id: crypto.randomUUID(), time: "08:00", meds: selected.slice(0, medsPerBlock) },
      { id: crypto.randomUUID(), time: "14:00", meds: selected.slice(medsPerBlock, medsPerBlock * 2) },
      { id: crypto.randomUUID(), time: "20:00", meds: selected.slice(medsPerBlock * 2) },
    ];
    setBlocks(initialBlocks.filter(b => b.meds.length > 0));
  };

  const getCounts = () => {
    if (!interactionsData) return { grave: 0, moderada: 0, leve: 0 };
    return {
      grave: interactionsData.filter(i => i.severity === "grave").length,
      moderada: interactionsData.filter(i => i.severity === "moderada").length,
      leve: interactionsData.filter(i => i.severity === "leve").length,
    };
  };
  
  const counts = getCounts();

  const updateBlockTime = (blockId: string, newTime: string) => {
    setBlocks(prev => {
      const blockToUpdate = prev.find(b => b.id === blockId);
      if (!blockToUpdate) return prev;
      const existingBlock = prev.find(b => b.time === newTime && b.id !== blockId);
      if (existingBlock) {
        const medsFused = Array.from(new Set([...existingBlock.meds, ...blockToUpdate.meds]));
        return prev.filter(b => b.id !== blockId).map(b => b.id === existingBlock.id ? { ...b, meds: medsFused } : b);
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
        if (remaining.length === 0) return [{ id: crypto.randomUUID(), time: "10:00", meds: blockToRemove.meds }];
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
    const timeStr = currentTime || "08:00";
    const parts = timeStr.split(":");
    setTempHour(parts[0] || "08"); setTempMinute(parts[1] || "00"); setEditingBlockId(blockId);
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
    updateBlockTime(editingBlockId, `${tempHour.padStart(2, "0")}:${tempMinute.padStart(2, "0")}`);
  };

  const EditTimeAlert = () => {
    if (!editingBlockId) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4 transition-opacity backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-[#F5F5F7] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <div className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
            <h3 className="text-xl font-bold tracking-tight text-black">Alterar Horário</h3>
            <p className="mt-1 text-xs text-gray-500 font-medium">
              A prescrição inteira do bloco será movida.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-4">
              {/* Hora */}
              <div className="flex flex-col items-center">
                <button onClick={() => adjustTime('hour', true)} className="p-4 text-gray-400 hover:text-black transition-colors active:scale-95"><ChevronDown className="w-8 h-8 rotate-180" strokeWidth={3} /></button>
                <div className="w-24 h-24 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-5xl font-black tabular-nums tracking-tighter text-black">{tempHour}</span>
                </div>
                <button onClick={() => adjustTime('hour', false)} className="p-4 text-gray-400 hover:text-black transition-colors active:scale-95"><ChevronDown className="w-8 h-8" strokeWidth={3} /></button>
              </div>

              <span className="text-4xl font-black text-gray-300 pb-2">:</span>

              {/* Minuto */}
              <div className="flex flex-col items-center">
                <button onClick={() => adjustTime('minute', true)} className="p-4 text-gray-400 hover:text-black transition-colors active:scale-95"><ChevronDown className="w-8 h-8 rotate-180" strokeWidth={3} /></button>
                <div className="w-24 h-24 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100">
                  <span className="text-5xl font-black tabular-nums tracking-tighter text-black">{tempMinute}</span>
                </div>
                <button onClick={() => adjustTime('minute', false)} className="p-4 text-gray-400 hover:text-black transition-colors active:scale-95"><ChevronDown className="w-8 h-8" strokeWidth={3} /></button>
              </div>
            </div>
          </div>
          <div className="p-5 flex gap-3 shrink-0">
            <button onClick={() => setEditingBlockId(null)} className="w-[40%] py-4 rounded-full bg-[#E5E5EA] text-black font-bold text-sm active:scale-95 transition-transform">Cancelar</button>
            <button onClick={handleConfirmTime} className="w-[60%] py-4 rounded-full bg-black text-white font-bold text-sm active:scale-95 transition-transform">Confirmar</button>
          </div>
        </div>
      </div>
    );
  };

  if (!mounted) return <div className="min-h-screen bg-[#F5F5F7]" />;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 bg-[#F5F5F7] overflow-x-hidden">
      <header className="mb-8 flex justify-between items-center">
        <h1 onClick={() => setStep("search")} className="text-3xl font-black tracking-tighter text-black cursor-pointer select-none active:opacity-50 transition-opacity">InteraMed</h1>
        {step !== "search" && (
          <button onClick={() => setStep("search")} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft size={14} strokeWidth={3} /> Editar
          </button>
        )}
      </header>

      <main className="flex-1 w-full">
        {step === "search" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative">
              <input
                ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setHi(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, suggestions.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
                  if (e.key === "Enter" && suggestions[hi]) add(suggestions[hi]);
                  if (e.key === "Backspace" && !query && selected.length) remove(selected[selected.length - 1]!);
                }}
                placeholder="Buscar princípio ativo..."
                className="w-full rounded-2xl bg-white px-5 py-4 text-lg font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-black placeholder:text-gray-400"
              />
              {isSearching && <div className="absolute right-5 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}
              {suggestions.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
                  {suggestions.map((m, i) => (
                    <li key={m}><button onMouseDown={(e) => { e.preventDefault(); add(m); }} onMouseEnter={() => setHi(i)} className={`w-full px-5 py-3 text-left text-base font-medium ${i === hi ? "bg-gray-100" : ""}`}>{m}</button></li>
                  ))}
                </ul>
              )}
            </div>

            {selected.length > 0 && (
              <div className="mt-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Selecionados</span>
                  <button onClick={clearAll} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={12} strokeWidth={2.5} /> Limpar tudo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.map((m) => (
                    <span key={m} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-2 text-sm font-bold shadow-sm border border-gray-100">
                      {m}
                      <button onClick={() => remove(m)} className="rounded-full w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors">X</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected.length >= 2 && (
              <button onClick={verify} className="mt-8 w-full rounded-full bg-black px-6 py-4 text-base font-bold text-white transition active:scale-[0.98] shadow-lg shadow-black/10">
                Verificar Interações
              </button>
            )}
          </div>
        )}

        {step === "interactions" && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-black tracking-tight text-black">
              {loadingInteractions ? "Analisando..." : (
                counts.grave + counts.moderada + counts.leve === 0 ? "Nenhuma interação encontrada" : 
                [counts.grave && `${counts.grave} graves`, counts.moderada && `${counts.moderada} moderadas`, counts.leve && `${counts.leve} leves`].filter(Boolean).join(", ")
              )}
            </h2>
            <p className="mt-1 text-xs text-gray-500 font-medium">{selected.length} fármacos verificados</p>
            
            <div className="mt-6 space-y-4">
              {loadingInteractions ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold">Cruzando dados ANVISA e FDA...</p>
                </div>
              ) : (
                selected.map((m) => (
                  <MedicationCard key={m} primaryDrug={m} interactions={interactionsData || []} />
                ))
              )}
            </div>

            <div className="mt-10 flex justify-center pb-8">
              <button onClick={() => setStep("schedule")} className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-5 py-3 text-xs font-bold text-black shadow-sm hover:shadow-md transition-all active:scale-95">
                <Clock size={16} strokeWidth={2.5} className="text-black" /> Organizar Horários
              </button>
            </div>
          </section>
        )}

        {step === "schedule" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-300 pb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight text-black">Horários</h2>
              <button onClick={() => setStep("interactions")} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black shrink-0">✕</button>
            </div>
            
            <div className="mb-6 p-4 rounded-3xl bg-white shadow-sm border border-gray-100 flex flex-col gap-3">
              <div><span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Paciente</span><p className="text-sm font-bold">{CONTEXT_DATA.patientName}</p></div>
              <div className="flex gap-4 text-xs bg-[#F9F9F9] p-2.5 rounded-xl">
                <div><span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Entrega</span><span className="font-bold text-black">{CONTEXT_DATA.prescriptionDeliveryTime}</span></div>
                <div><span className="text-[9px] font-bold uppercase tracking-wider text-red-500 block">Troca Plantão</span><span className="font-bold text-red-500">{CONTEXT_DATA.shiftChangeTime}</span></div>
              </div>
            </div>

            <div className="flex items-center overflow-x-auto pb-4 mb-2 snap-x gap-1 custom-scrollbar">
              {uniqueTimelineTimes.map((time, i) => (
                <div key={time} className="flex shrink-0 items-center snap-center">
                  {i > 0 && <span className="h-px w-4 bg-gray-300" />}
                  <div className="flex flex-col items-center gap-1.5 px-1"><span className="h-2 w-2 rounded-full bg-black shadow-sm" /><span className="text-[10px] font-bold text-gray-600">{time}</span></div>
                </div>
              ))}
            </div>

            <div className="space-y-3 w-full">
              {sortedBlocks.map(block => (
                <div key={block.id} className="bg-white rounded-[24px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 w-full max-w-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(block.id, block.time)} className="text-2xl font-black tracking-tighter hover:text-gray-600 transition-colors shrink-0">{block.time}</button>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-[#F2F2F7] px-2 py-0.5 rounded-md shrink-0">{block.meds.length} MEDS</span>
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors shrink-0">Remover</button>
                  </div>
                  <details className="group w-full">
                    <summary className="flex items-center justify-between w-full py-2 cursor-pointer list-none text-gray-600 hover:text-black transition-colors select-none">
                      <span className="text-xs font-bold">Ver medicamentos</span>
                      <ChevronDown size={16} strokeWidth={3} className="text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2 pb-1 w-full">
                      {block.meds.length === 0 ? (<p className="text-xs text-gray-400 italic">Nenhum medicamento.</p>) : (
                        block.meds.map(med => {
                          const hasIntraBlockInteraction = block.meds.some(other => other !== med && getInteraction(med, other).severity === "grave");
                          return (
                            <div key={med} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl w-full ${hasIntraBlockInteraction ? 'bg-red-50' : 'bg-[#F9F9F9]'}`}>
                              <span className={`text-xs font-bold break-words max-w-full ${hasIntraBlockInteraction ? 'text-red-700' : 'text-gray-800'}`}>{med}</span>
                              {sortedBlocks.length > 1 && (
                                <select value={block.id} onChange={(e) => moveMed(med, e.target.value)} className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-500 outline-none cursor-pointer shrink-0 w-full sm:w-auto">
                                  {sortedBlocks.map(b => (<option key={b.id} value={b.id} disabled={b.id === block.id}>Mover p/ {b.time}</option>))}
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
            <button onClick={addBlock} className="mt-4 w-full py-3 rounded-full border-2 border-dashed border-gray-300 text-gray-500 text-xs font-bold hover:border-gray-400 hover:text-gray-600 transition-colors">+ Adicionar Horário</button>
          </section>
        )}
      </main>
      
      {step !== "search" && <TransparencyNotice />}
      <EditTimeAlert />
    </div>
  );
}