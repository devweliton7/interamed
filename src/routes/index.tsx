// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Loader2, Trash2, Search, Terminal, Camera, Clock } from "lucide-react";
import { MEDS } from "@/lib/meds";
import { buscarMedicamentosANVISA } from "../services/anvisa";
import { useInteractions } from "../hooks/useInteractions";
import { MedicationCard } from "../components/interactions/MedicationCard";
import { TransparencyNotice } from "../components/TransparencyNotice";
import { OCRScanner } from "../components/OCRScanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "InteraMed" }, { name: "description", content: "Verifique interações medicamentosas." }],
  }),
  component: Index,
});

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Index() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"search" | "results">("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  const { interactionsData, loadingInteractions } = useInteractions(selected);

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
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [query, selected, mounted]);

  const add = (m: string) => { 
    if (!selected.includes(m)) setSelected((s) => [...s, m]); 
    setQuery(""); setHi(0); inputRef.current?.focus(); 
  };
  
  const remove = (m: string) => setSelected((s) => s.filter((x) => x !== m));
  const clearAll = () => setSelected([]);
  const handleOcrExtract = (meds: string[]) => setSelected(prev => Array.from(new Set([...prev, ...meds])));
  const verify = () => setStep("results");

  const getCounts = () => {
    if (!interactionsData) return { grave: 0, moderada: 0, leve: 0 };
    return {
      grave: interactionsData.filter(i => i.severity === "grave").length,
      moderada: interactionsData.filter(i => i.severity === "moderada").length,
      leve: interactionsData.filter(i => i.severity === "leve").length,
    };
  };
  
  const counts = getCounts();

  if (!mounted) return <div className="min-h-screen bg-[#F5F5F7]" />;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 safe-area-top safe-area-bottom bg-[#F5F5F7] overflow-x-hidden">
      <header className="mb-6 flex justify-between items-center">
        <h1 onClick={() => setStep("search")} className="text-3xl font-black tracking-tighter text-black cursor-pointer">
          InteraMed
        </h1>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/aprazamento" 
            className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 shadow-sm hover:bg-blue-100 transition-colors min-h-[44px]"
          >
            <Clock size={16} strokeWidth={2.5} /> Aprazamento
          </Link>
          
          {step === "results" && (
            <button onClick={() => setStep("search")} className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-black shadow-sm min-h-[44px]">
              <ChevronLeft size={16} strokeWidth={3} /> Editar
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        {step === "search" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col">
            <div className="relative">
              <input
                ref={inputRef} value={query} 
                onChange={(e) => { setQuery(e.target.value); setHi(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, suggestions.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
                  if (e.key === "Enter" && suggestions[hi]) add(suggestions[hi]);
                  if (e.key === "Backspace" && !query && selected.length) remove(selected[selected.length - 1]!);
                }}
                placeholder="Buscar ou escanear..."
                className="w-full rounded-2xl bg-white pl-12 pr-24 py-4 text-base font-medium shadow-sm outline-none focus:ring-2 focus:ring-black"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {!isSearching && selected.length > 0 && (
                  <button onClick={clearAll} className="text-gray-400 hover:text-red-500 bg-gray-50 p-2.5 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                )}
                <button onClick={() => setIsOcrOpen(true)} className="bg-black text-white p-2.5 rounded-xl shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Camera size={18} strokeWidth={2.5} />
                </button>
              </div>

              {suggestions.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 max-h-[40vh] overflow-y-auto no-scrollbar">
                  {suggestions.map((m, i) => (
                    <li key={m}>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); add(m); }} 
                        onMouseEnter={() => setHi(i)} 
                        className={`w-full px-5 py-3 text-left font-medium ${i === hi ? "bg-gray-100" : ""}`}
                      >
                        {m}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selected.length > 0 && (
              <div className="mt-6 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Selecionados ({selected.length})</span>
                  <button onClick={clearAll} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-500 p-2">
                    <Trash2 size={14} /> Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.map((m) => (
                    <span key={m} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 text-sm font-bold shadow-sm border border-gray-100">
                      {m}
                      <button onClick={() => remove(m)} className="rounded-full w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500">
                        X
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected.length >= 2 && (
              <div className="mt-auto pt-6 pb-4">
                <button onClick={verify} className="w-full rounded-full bg-black px-6 py-4 font-bold text-white shadow-lg flex justify-center gap-2 min-h-[56px] text-lg">
                  Verificar {selected.length} Interações
                </button>
              </div>
            )}
          </div>
        )}

        {step === "results" && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-300 pb-12">
            
            {/* 🔑 AVISO DE AMBIENTE DEMONSTRATIVO MOVIDO PARA O TOPO */}
            <div className="mb-6 rounded-2xl bg-white p-4 border border-gray-200/60 shadow-sm flex items-start gap-3">
              <div className="bg-[#F5F5F7] border border-gray-200 text-black rounded-xl w-8 h-8 flex items-center justify-center shrink-0">
                <Terminal size={14} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  <strong className="text-black font-bold uppercase tracking-wider text-[10px] block mb-0.5">Ambiente Demonstrativo</strong> 
                  Dados clínicos serão injetados via API em produção.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-black leading-tight">
                {loadingInteractions ? "Analisando..." : (
                  counts.grave > 0 
                    ? `Atenção: ${counts.grave} Risco(s) Grave(s)` 
                    : counts.moderada > 0 
                      ? (counts.moderada === 1 ? "Cuidado: 1 Interação Moderada" : `Cuidado: ${counts.moderada} Interações Moderadas`)
                      : counts.leve > 0
                        ? (counts.leve === 1 ? "Atenção: 1 Interação Leve" : `Atenção: ${counts.leve} Interações Leves`)
                        : "Nenhuma interação encontrada"
                )}
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {loadingInteractions ? "Cruzando dados clínicos..." : `Análise de ${selected.length} medicamentos.`}
              </p>
            </div>
            
            <div className="space-y-3">
              {loadingInteractions ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">Consultando...</p>
                </div>
              ) : (
                selected.map((m) => (
                  <MedicationCard key={m} primaryDrug={m} interactions={interactionsData || []} />
                ))
              )}
            </div>

            {!loadingInteractions && (
              <div className="mt-12">
                {/* Nota de rodapé discreta */}
                <div className="mb-6 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">
                    Nota: Resultados simulados. Integração com Prontuário Eletrônico em produção.
                  </p>
                </div>
                <TransparencyNotice />
              </div>
            )}
          </section>
        )}
      </main>

      <OCRScanner isOpen={isOcrOpen} onClose={() => setIsOcrOpen(false)} onExtract={handleOcrExtract} />
    </div>
  );
}