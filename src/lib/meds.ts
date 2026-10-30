export type Severity = "grave" | "moderada" | "leve" | "nenhuma" | "semdado";

export const MEDS = [
  "Amoxicilina", "Anlodipino", "Captopril", "Ciprofloxacino", "Clopidogrel",
  "Dexametasona", "Digoxina", "Dipirona", "Enoxaparina", "Espironolactona",
  "Furosemida", "Hidroclorotiazida", "Ibuprofeno", "Losartana", "Metformina",
  "Omeprazol", "Paracetamol", "Prednisona", "Sinvastatina", "Varfarina",
];

type Info = { severity: Exclude<Severity, "nenhuma" | "semdado">; desc: string; rec: string };

const key = (a: string, b: string) => [a, b].sort().join("|");

const RAW: [string, string, Info][] = [
  ["Varfarina", "Ibuprofeno", { severity: "grave", desc: "Risco elevado de sangramento.", rec: "Evitar associação. Comunicar o médico." }],
  ["Varfarina", "Dipirona", { severity: "moderada", desc: "Pode aumentar o efeito anticoagulante.", rec: "Monitorar sinais de sangramento." }],
  ["Varfarina", "Ciprofloxacino", { severity: "grave", desc: "Aumenta o efeito da varfarina.", rec: "Monitorar INR. Avisar o médico." }],
  ["Clopidogrel", "Omeprazol", { severity: "moderada", desc: "Reduz o efeito antiplaquetário.", rec: "Preferir outro protetor gástrico." }],
  ["Clopidogrel", "Varfarina", { severity: "grave", desc: "Risco alto de sangramento.", rec: "Confirmar prescrição com o médico." }],
  ["Captopril", "Espironolactona", { severity: "moderada", desc: "Eleva o potássio no sangue.", rec: "Monitorar potássio." }],
  ["Losartana", "Espironolactona", { severity: "moderada", desc: "Eleva o potássio no sangue.", rec: "Monitorar potássio." }],
  ["Dipirona", "Enoxaparina", { severity: "moderada", desc: "Risco de sangramento.", rec: "Observar sangramentos e hematomas." }],
  ["Losartana", "Ibuprofeno", { severity: "moderada", desc: "Reduz o efeito anti-hipertensivo.", rec: "Monitorar pressão arterial." }],
  ["Captopril", "Ibuprofeno", { severity: "moderada", desc: "Reduz o efeito anti-hipertensivo.", rec: "Monitorar pressão e função renal." }],
  ["Dipirona", "Paracetamol", { severity: "leve", desc: "Monitorar função hepática.", rec: "Respeitar doses máximas." }],
  ["Digoxina", "Furosemida", { severity: "moderada", desc: "Baixa de potássio aumenta toxicidade da digoxina.", rec: "Monitorar potássio e frequência cardíaca." }],
  ["Digoxina", "Hidroclorotiazida", { severity: "moderada", desc: "Baixa de potássio aumenta toxicidade da digoxina.", rec: "Monitorar potássio." }],
  ["Digoxina", "Espironolactona", { severity: "leve", desc: "Pode alterar nível de digoxina.", rec: "Observar sinais de toxicidade." }],
  ["Ibuprofeno", "Enoxaparina", { severity: "grave", desc: "Risco elevado de sangramento.", rec: "Evitar associação." }],
  ["Ibuprofeno", "Dexametasona", { severity: "moderada", desc: "Risco de úlcera gástrica.", rec: "Considerar protetor gástrico." }],
  ["Ciprofloxacino", "Dexametasona", { severity: "moderada", desc: "Risco de lesão em tendões.", rec: "Observar dor em tendões." }],
  ["Metformina", "Dexametasona", { severity: "leve", desc: "Pode elevar a glicemia.", rec: "Monitorar glicemia capilar." }],
  ["Sinvastatina", "Anlodipino", { severity: "leve", desc: "Aumenta nível de sinvastatina.", rec: "Observar dor muscular." }],
  ["Furosemida", "Dexametasona", { severity: "leve", desc: "Pode baixar o potássio.", rec: "Monitorar potássio." }],
];

const MAP = new Map(RAW.map(([a, b, i]) => [key(a, b), i]));
// Pares sem dado (simulado)
const NO_DATA = new Set([key("Amoxicilina", "Metformina"), key("Prednisona", "Sinvastatina")]);

export function getInteraction(a: string, b: string): { severity: Severity; desc: string; rec: string } {
  const i = MAP.get(key(a, b));
  if (i) return i;
  if (NO_DATA.has(key(a, b))) return { severity: "semdado", desc: "Sem dados disponíveis.", rec: "Consultar o farmacêutico." };
  return { severity: "nenhuma", desc: "Sem interação conhecida.", rec: "" };
}

export const interacts = (a: string, b: string) => {
  const s = getInteraction(a, b).severity;
  return s === "grave" || s === "moderada" || s === "leve";
};

export type Slot = { id: string; minutes: number; meds: string[] };

export const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const fromHHMM = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Distribui a partir das 10h, com 2h entre medicamentos que interagem. */
export function distribute(meds: string[]): Slot[] {
  const slots: Slot[] = [];
  for (const med of meds) {
    let t = 600;
    while (slots.some((s) => Math.abs(s.minutes - t) < 120 && s.meds.some((o) => interacts(o, med)))) t += 120;
    const slot = slots.find((s) => s.minutes === t);
    if (slot) slot.meds.push(med);
    else slots.push({ id: crypto.randomUUID(), minutes: t, meds: [med] });
  }
  return slots.sort((a, b) => a.minutes - b.minutes);
}

export function validate(slots: Slot[]): string[] {
  const w: string[] = [];
  for (const s of slots) if (s.minutes < 600) w.push(`${toHHMM(s.minutes)} está antes das 10h.`);
  for (let i = 0; i < slots.length; i++)
    for (let j = i; j < slots.length; j++) {
      const a = slots[i]!, b = slots[j]!;
      if (Math.abs(a.minutes - b.minutes) >= 120) continue;
      for (const x of a.meds) for (const y of b.meds)
        if (x < y && interacts(x, y) && !(i !== j && a.meds.includes(y) && b.meds.includes(x)))
          w.push(`${x} e ${y} com menos de 2h de intervalo.`);
    }
  return [...new Set(w)];
}
