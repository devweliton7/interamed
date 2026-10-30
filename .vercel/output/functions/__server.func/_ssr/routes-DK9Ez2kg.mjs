import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as ChevronLeft, r as ChevronDown, t as Clock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DK9Ez2kg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MEDS = [
	"Amoxicilina",
	"Anlodipino",
	"Captopril",
	"Ciprofloxacino",
	"Clopidogrel",
	"Dexametasona",
	"Digoxina",
	"Dipirona",
	"Enoxaparina",
	"Espironolactona",
	"Furosemida",
	"Hidroclorotiazida",
	"Ibuprofeno",
	"Losartana",
	"Metformina",
	"Omeprazol",
	"Paracetamol",
	"Prednisona",
	"Sinvastatina",
	"Varfarina"
];
var key = (a, b) => [a, b].sort().join("|");
var MAP = new Map([
	[
		"Varfarina",
		"Ibuprofeno",
		{
			severity: "grave",
			desc: "Risco elevado de sangramento.",
			rec: "Evitar associação. Comunicar o médico."
		}
	],
	[
		"Varfarina",
		"Dipirona",
		{
			severity: "moderada",
			desc: "Pode aumentar o efeito anticoagulante.",
			rec: "Monitorar sinais de sangramento."
		}
	],
	[
		"Varfarina",
		"Ciprofloxacino",
		{
			severity: "grave",
			desc: "Aumenta o efeito da varfarina.",
			rec: "Monitorar INR. Avisar o médico."
		}
	],
	[
		"Clopidogrel",
		"Omeprazol",
		{
			severity: "moderada",
			desc: "Reduz o efeito antiplaquetário.",
			rec: "Preferir outro protetor gástrico."
		}
	],
	[
		"Clopidogrel",
		"Varfarina",
		{
			severity: "grave",
			desc: "Risco alto de sangramento.",
			rec: "Confirmar prescrição com o médico."
		}
	],
	[
		"Captopril",
		"Espironolactona",
		{
			severity: "moderada",
			desc: "Eleva o potássio no sangue.",
			rec: "Monitorar potássio."
		}
	],
	[
		"Losartana",
		"Espironolactona",
		{
			severity: "moderada",
			desc: "Eleva o potássio no sangue.",
			rec: "Monitorar potássio."
		}
	],
	[
		"Dipirona",
		"Enoxaparina",
		{
			severity: "moderada",
			desc: "Risco de sangramento.",
			rec: "Observar sangramentos e hematomas."
		}
	],
	[
		"Losartana",
		"Ibuprofeno",
		{
			severity: "moderada",
			desc: "Reduz o efeito anti-hipertensivo.",
			rec: "Monitorar pressão arterial."
		}
	],
	[
		"Captopril",
		"Ibuprofeno",
		{
			severity: "moderada",
			desc: "Reduz o efeito anti-hipertensivo.",
			rec: "Monitorar pressão e função renal."
		}
	],
	[
		"Dipirona",
		"Paracetamol",
		{
			severity: "leve",
			desc: "Monitorar função hepática.",
			rec: "Respeitar doses máximas."
		}
	],
	[
		"Digoxina",
		"Furosemida",
		{
			severity: "moderada",
			desc: "Baixa de potássio aumenta toxicidade da digoxina.",
			rec: "Monitorar potássio e frequência cardíaca."
		}
	],
	[
		"Digoxina",
		"Hidroclorotiazida",
		{
			severity: "moderada",
			desc: "Baixa de potássio aumenta toxicidade da digoxina.",
			rec: "Monitorar potássio."
		}
	],
	[
		"Digoxina",
		"Espironolactona",
		{
			severity: "leve",
			desc: "Pode alterar nível de digoxina.",
			rec: "Observar sinais de toxicidade."
		}
	],
	[
		"Ibuprofeno",
		"Enoxaparina",
		{
			severity: "grave",
			desc: "Risco elevado de sangramento.",
			rec: "Evitar associação."
		}
	],
	[
		"Ibuprofeno",
		"Dexametasona",
		{
			severity: "moderada",
			desc: "Risco de úlcera gástrica.",
			rec: "Considerar protetor gástrico."
		}
	],
	[
		"Ciprofloxacino",
		"Dexametasona",
		{
			severity: "moderada",
			desc: "Risco de lesão em tendões.",
			rec: "Observar dor em tendões."
		}
	],
	[
		"Metformina",
		"Dexametasona",
		{
			severity: "leve",
			desc: "Pode elevar a glicemia.",
			rec: "Monitorar glicemia capilar."
		}
	],
	[
		"Sinvastatina",
		"Anlodipino",
		{
			severity: "leve",
			desc: "Aumenta nível de sinvastatina.",
			rec: "Observar dor muscular."
		}
	],
	[
		"Furosemida",
		"Dexametasona",
		{
			severity: "leve",
			desc: "Pode baixar o potássio.",
			rec: "Monitorar potássio."
		}
	]
].map(([a, b, i]) => [key(a, b), i]));
var NO_DATA = /* @__PURE__ */ new Set([key("Amoxicilina", "Metformina"), key("Prednisona", "Sinvastatina")]);
function getInteraction(a, b) {
	const i = MAP.get(key(a, b));
	if (i) return i;
	if (NO_DATA.has(key(a, b))) return {
		severity: "semdado",
		desc: "Sem dados disponíveis.",
		rec: "Consultar o farmacêutico."
	};
	return {
		severity: "nenhuma",
		desc: "Sem interação conhecida.",
		rec: ""
	};
}
function usePersistentState(key, initialValue) {
	const [state, setState] = (0, import_react.useState)(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Erro ao ler localStorage key "${key}":`, error);
			return initialValue;
		}
	});
	(0, import_react.useEffect)(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(state));
		} catch (error) {
			console.warn(`Erro ao salvar localStorage key "${key}":`, error);
		}
	}, [key, state]);
	return [state, setState];
}
var DOT = {
	grave: "bg-sev-grave",
	moderada: "bg-sev-moderada",
	leve: "bg-sev-leve",
	nenhuma: "bg-sev-nenhuma",
	semdado: "bg-sev-semdado"
};
var BAR = {
	grave: "border-sev-grave",
	moderada: "border-sev-moderada",
	leve: "border-sev-leve",
	nenhuma: "border-sev-nenhuma",
	semdado: "border-sev-semdado"
};
var LABEL = {
	grave: "Grave",
	moderada: "Moderada",
	leve: "Leve",
	nenhuma: "Sem interação",
	semdado: "Sem dado"
};
var strip = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
var CONTEXT_DATA = {
	prescriptionDeliveryTime: "10:00",
	shiftChangeTime: "19:00",
	patientName: "Leito 12"
};
function Index() {
	const [step, setStep] = (0, import_react.useState)("search");
	const [query, setQuery] = usePersistentState("interamed-query", "");
	const [selected, setSelected] = usePersistentState("interamed-selected", []);
	const [hi, setHi] = (0, import_react.useState)(0);
	const [open, setOpen] = (0, import_react.useState)(null);
	const [blocks, setBlocks] = (0, import_react.useState)([]);
	const [online, setOnline] = (0, import_react.useState)(true);
	const inputRef = (0, import_react.useRef)(null);
	const [editingBlockId, setEditingBlockId] = (0, import_react.useState)(null);
	const [tempHour, setTempHour] = (0, import_react.useState)("08");
	const [tempMinute, setTempMinute] = (0, import_react.useState)("00");
	(0, import_react.useEffect)(() => {
		const up = () => setOnline(navigator.onLine);
		up();
		window.addEventListener("online", up);
		window.addEventListener("offline", up);
		return () => {
			window.removeEventListener("online", up);
			window.removeEventListener("offline", up);
		};
	}, []);
	const handleHome = () => {
		setStep("search");
		setOpen(null);
	};
	const suggestions = (0, import_react.useMemo)(() => {
		const q = strip(query.trim());
		if (!q) return [];
		return MEDS.filter((m) => !selected.includes(m) && strip(m).includes(q)).slice(0, 6);
	}, [query, selected]);
	const add = (m) => {
		setSelected((s) => [...s, m]);
		setQuery("");
		setHi(0);
		inputRef.current?.focus();
	};
	const remove = (m) => setSelected((s) => s.filter((x) => x !== m));
	const verify = () => {
		setStep("interactions");
		setOpen(null);
		const medsPerBlock = Math.ceil(selected.length / 3);
		const initialBlocks = [
			{
				id: crypto.randomUUID(),
				time: "08:00",
				meds: selected.slice(0, medsPerBlock)
			},
			{
				id: crypto.randomUUID(),
				time: "14:00",
				meds: selected.slice(medsPerBlock, medsPerBlock * 2)
			},
			{
				id: crypto.randomUUID(),
				time: "20:00",
				meds: selected.slice(medsPerBlock * 2)
			}
		];
		setBlocks(initialBlocks.filter((b) => b.meds.length > 0));
	};
	const pairs = (0, import_react.useMemo)(() => {
		if (step === "search" || selected.length === 0) return [];
		const out = [];
		for (let i = 0; i < selected.length; i++) for (let j = i + 1; j < selected.length; j++) out.push(getInteraction(selected[i], selected[j]).severity);
		return out;
	}, [selected, step]);
	const count = (s) => pairs.filter((p) => p === s).length;
	const updateBlockTime = (blockId, newTime) => {
		setBlocks((prev) => {
			const blockToUpdate = prev.find((b) => b.id === blockId);
			if (!blockToUpdate) return prev;
			const existingBlock = prev.find((b) => b.time === newTime && b.id !== blockId);
			if (existingBlock) {
				const medsFused = Array.from(/* @__PURE__ */ new Set([...existingBlock.meds, ...blockToUpdate.meds]));
				return prev.filter((b) => b.id !== blockId).map((b) => b.id === existingBlock.id ? {
					...b,
					meds: medsFused
				} : b);
			} else return prev.map((b) => b.id === blockId ? {
				...b,
				time: newTime
			} : b);
		});
		setEditingBlockId(null);
	};
	const addBlock = () => {
		const defaultTimes = [
			"10:00",
			"16:00",
			"22:00",
			"06:00",
			"12:00",
			"18:00",
			"00:00"
		];
		const existingTimes = new Set(blocks.map((b) => b.time));
		const nextTime = defaultTimes.find((t) => !existingTimes.has(t)) || "12:00";
		setBlocks((prev) => [...prev, {
			id: crypto.randomUUID(),
			time: nextTime,
			meds: []
		}]);
	};
	const removeBlock = (blockId) => {
		const blockToRemove = blocks.find((b) => b.id === blockId);
		if (!blockToRemove) return;
		setBlocks((prev) => {
			const remaining = prev.filter((b) => b.id !== blockId);
			if (blockToRemove.meds.length > 0) {
				if (remaining.length === 0) return [{
					id: crypto.randomUUID(),
					time: "10:00",
					meds: blockToRemove.meds
				}];
				const newRemaining = [...remaining];
				newRemaining[0].meds = Array.from(/* @__PURE__ */ new Set([...newRemaining[0].meds, ...blockToRemove.meds]));
				return newRemaining;
			}
			return remaining;
		});
	};
	const moveMed = (medName, targetBlockId) => {
		setBlocks((prev) => {
			return prev.map((b) => ({
				...b,
				meds: b.meds.filter((m) => m !== medName)
			})).map((b) => b.id === targetBlockId ? {
				...b,
				meds: [...b.meds, medName]
			} : b);
		});
	};
	const sortedBlocks = (0, import_react.useMemo)(() => {
		return [...blocks].sort((a, b) => {
			const [hA, mA] = a.time.split(":").map(Number);
			const [hB, mB] = b.time.split(":").map(Number);
			return hA * 60 + mA - (hB * 60 + mB);
		});
	}, [blocks]);
	const uniqueTimelineTimes = (0, import_react.useMemo)(() => {
		const times = new Set(sortedBlocks.map((b) => b.time));
		return Array.from(times).sort((a, b) => {
			const [hA, mA] = a.split(":").map(Number);
			const [hB, mB] = b.split(":").map(Number);
			return hA * 60 + mA - (hB * 60 + mB);
		});
	}, [sortedBlocks]);
	const openEditModal = (blockId, currentTime) => {
		const [h, m] = currentTime.split(":");
		setTempHour(h || "08");
		setTempMinute(m || "00");
		setEditingBlockId(blockId);
	};
	const adjustTime = (type, increment) => {
		if (type === "hour") {
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
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4 transition-opacity backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white/90 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center pt-3 pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-1.5 bg-gray-300 rounded-full" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 pt-2 pb-6 overflow-y-auto custom-scrollbar flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-2xl font-extrabold tracking-tight text-black",
								children: "Atenção"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-gray-500 leading-relaxed font-medium",
								children: [
									"Prescrição válida por ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-black",
										children: "24 horas"
									}),
									". Alterar este horário afeta todos os medicamentos do bloco."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 bg-[#F2F2F7] p-5 rounded-3xl space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold uppercase tracking-widest text-gray-500",
										children: "Entrega"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-base font-bold text-black mt-0.5",
										children: [
											CONTEXT_DATA.prescriptionDeliveryTime,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-gray-400 text-sm",
												children: "(Válida 24h)"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-bold uppercase tracking-widest text-red-600",
											children: "Troca de Plantão"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-base font-bold text-red-600 mt-0.5",
											children: CONTEXT_DATA.shiftChangeTime
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red-500 mt-1 font-semibold",
											children: "Evite 30 min antes ou depois."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold uppercase tracking-widest text-gray-500",
										children: "Sugestão"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-base font-bold text-black mt-0.5",
										children: "1h a 2h após entrega."
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-bold text-black",
									children: "Novo horário do bloco:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center justify-center gap-6 h-[200px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center h-full justify-between py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => adjustTime("hour", true),
													className: "w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xl",
														children: "▲"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-20 h-20 flex items-center justify-center",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-5xl font-extrabold tabular-nums tracking-tighter",
														children: tempHour
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => adjustTime("hour", false),
													className: "w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xl",
														children: "▼"
													})
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-4xl font-extrabold text-gray-300 pb-2",
											children: ":"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center h-full justify-between py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => adjustTime("minute", true),
													className: "w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xl",
														children: "▲"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-20 h-20 flex items-center justify-center",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-5xl font-extrabold tabular-nums tracking-tighter",
														children: tempMinute
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => adjustTime("minute", false),
													className: "w-14 h-14 flex items-center justify-center bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xl",
														children: "▼"
													})
												})
											]
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 border-t border-gray-100 bg-white/50 rounded-b-[32px] flex gap-3 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditingBlockId(null),
							className: "w-[40%] py-4 rounded-full bg-[#E5E5EA] text-black font-bold text-sm active:scale-95 transition-transform",
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleConfirmTime,
							className: "w-[60%] py-4 rounded-full bg-black text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-black/20",
							children: "Confirmar"
						})]
					})
				]
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 bg-[#F9F9F9] overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-8 flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					onClick: handleHome,
					className: "text-4xl font-extrabold tracking-tighter text-black cursor-pointer select-none active:opacity-50 transition-opacity",
					title: "Voltar ao início",
					children: "InteraMed"
				}), step !== "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setStep("search"),
					className: "flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
						size: 16,
						strokeWidth: 2.5
					}), "Editar lista"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 w-full",
				children: [
					step === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "animate-in fade-in slide-in-from-bottom-4 duration-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: inputRef,
									value: query,
									onChange: (e) => {
										setQuery(e.target.value);
										setHi(0);
									},
									onKeyDown: (e) => {
										if (e.key === "ArrowDown") {
											e.preventDefault();
											setHi((h) => Math.min(h + 1, suggestions.length - 1));
										}
										if (e.key === "ArrowUp") {
											e.preventDefault();
											setHi((h) => Math.max(h - 1, 0));
										}
										if (e.key === "Enter" && suggestions[hi]) add(suggestions[hi]);
										if (e.key === "Backspace" && !query && selected.length) remove(selected[selected.length - 1]);
									},
									placeholder: "Buscar medicamento...",
									className: "w-full rounded-2xl bg-white px-6 py-5 text-xl font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-black placeholder:text-gray-400"
								}), suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100",
									children: suggestions.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onMouseDown: (e) => {
											e.preventDefault();
											add(m);
										},
										onMouseEnter: () => setHi(i),
										className: `w-full px-6 py-4 text-left text-lg font-medium ${i === hi ? "bg-gray-100" : ""}`,
										children: m
									}) }, m))
								})]
							}),
							selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 flex flex-wrap gap-2",
								children: selected.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-3 text-base font-semibold shadow-sm",
									children: [m, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => remove(m),
										className: "rounded-full w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors",
										children: "X"
									})]
								}, m))
							}),
							selected.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: verify,
								className: "mt-10 w-full rounded-full bg-black px-8 py-5 text-lg font-bold text-white transition active:scale-[0.98] shadow-xl shadow-black/10",
								children: "Verificar Interações"
							})
						]
					}),
					step === "interactions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "animate-in fade-in slide-in-from-right-8 duration-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl font-extrabold tracking-tight text-black",
								children: count("grave") + count("moderada") + count("leve") === 0 ? "Nenhuma interação" : [
									count("grave") && `${count("grave")} graves`,
									count("moderada") && `${count("moderada")} moderadas`,
									count("leve") && `${count("leve")} leves`
								].filter(Boolean).join(", ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-gray-500 font-medium",
								children: [selected.length, " medicamentos verificados"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 space-y-4",
								children: selected.map((m) => {
									const others = selected.filter((o) => o !== m).map((o) => ({
										o,
										...getInteraction(m, o)
									}));
									const hits = others.filter((x) => x.severity !== "nenhuma");
									const none = others.filter((x) => x.severity === "nenhuma");
									const isOpen = open === m;
									if (hits.length === 0 && none.length > 0) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setOpen(isOpen ? null : m),
											className: "flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg font-bold",
												children: m
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex gap-1.5 shrink-0",
												children: others.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-3 w-3 rounded-full ${DOT[x.severity]}` }, x.o))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "px-5 pb-5 space-y-3",
													children: hits.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: `border-l-4 ${BAR[x.severity]} bg-[#F9F9F9] py-3 pl-4 pr-3 rounded-r-xl`,
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-baseline justify-between gap-3",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-bold break-words",
																	children: x.o
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: `text-[10px] font-bold uppercase tracking-wider shrink-0 ${x.severity === "grave" ? "text-sev-grave" : "text-gray-500"}`,
																	children: LABEL[x.severity]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 text-sm font-medium",
																children: x.desc
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 text-xs text-gray-500",
																children: x.rec
															})
														]
													}, x.o))
												})
											})
										})]
									}, m);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-12 flex justify-center pb-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setStep("schedule"),
									className: "flex items-center gap-2.5 rounded-full bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-black shadow-sm hover:shadow-md transition-all active:scale-95",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 18,
										strokeWidth: 2.5,
										className: "text-black"
									}), "Gerenciar Horários"]
								})
							})
						]
					}),
					step === "schedule" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "animate-in fade-in slide-in-from-bottom-8 duration-300 pb-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center mb-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-3xl font-extrabold tracking-tight text-black",
									children: "Horários"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setStep("interactions"),
									className: "w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black shrink-0",
									children: "✕"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 p-5 rounded-3xl bg-white shadow-sm border border-gray-100 flex flex-col gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-between items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-gray-400",
										children: "Paciente"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-lg font-bold",
										children: CONTEXT_DATA.patientName
									})] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-6 text-sm bg-[#F9F9F9] p-3 rounded-2xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-gray-400 block",
										children: "Entrega"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-black",
										children: CONTEXT_DATA.prescriptionDeliveryTime
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-sev-grave block",
										children: "Troca Plantão"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sev-grave",
										children: CONTEXT_DATA.shiftChangeTime
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center overflow-x-auto pb-6 mb-2 snap-x gap-1 custom-scrollbar",
								children: uniqueTimelineTimes.map((time, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center snap-center",
									children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-6 bg-gray-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center gap-2 px-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-full bg-black shadow-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold text-gray-600",
											children: time
										})]
									})]
								}, time))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4 w-full",
								children: sortedBlocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 w-full max-w-full overflow-hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between border-b border-gray-100 pb-4 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => openEditModal(block.id, block.time),
												className: "text-3xl font-extrabold tracking-tighter hover:text-gray-600 transition-colors shrink-0",
												children: block.time
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-[#F2F2F7] px-2.5 py-1 rounded-md shrink-0",
												children: [block.meds.length, " MEDS"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => removeBlock(block.id),
											className: "text-xs font-semibold text-gray-400 hover:text-sev-grave transition-colors shrink-0",
											children: "Remover"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "group w-full",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
											className: "flex items-center justify-between w-full py-3 cursor-pointer list-none text-gray-600 hover:text-black transition-colors select-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium",
												children: "Ver medicamentos"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
												size: 18,
												strokeWidth: 2.5,
												className: "text-gray-400 transition-transform duration-300 group-open:rotate-180"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 space-y-2 pb-2 w-full",
											children: block.meds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-gray-400 italic",
												children: "Nenhum medicamento."
											}) : block.meds.map((med) => {
												const hasIntraBlockInteraction = block.meds.some((other) => other !== med && getInteraction(med, other).severity === "grave");
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: `flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl w-full ${hasIntraBlockInteraction ? "bg-red-50" : "bg-[#F9F9F9]"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `text-sm font-semibold break-words max-w-full ${hasIntraBlockInteraction ? "text-red-700" : "text-gray-800"}`,
														children: med
													}), sortedBlocks.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
														value: block.id,
														onChange: (e) => moveMed(med, e.target.value),
														className: "bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-gray-500 outline-none cursor-pointer shrink-0 w-full sm:w-auto",
														children: sortedBlocks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
															value: b.id,
															disabled: b.id === block.id,
															children: ["Mover p/ ", b.time]
														}, b.id))
													})]
												}, med);
											})
										})]
									})]
								}, block.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: addBlock,
								className: "mt-6 w-full py-4 rounded-full border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-gray-400 hover:text-gray-600 transition-colors",
								children: "+ Adicionar Horário"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-8 text-center text-xs font-medium text-gray-400",
				children: "Ferramenta de apoio. Sempre confirme com o farmacêutico."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditTimeAlert, {})
		]
	});
}
//#endregion
export { Index as component };
