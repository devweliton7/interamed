// src/lib/meds.ts
export type Severity = "grave" | "moderada" | "leve" | "nenhuma" | "semdado";

export const MEDS = [
  "Amiodarona", // <- ADICIONADO
  "Amoxicilina", "Anlodipino", "Captopril", "Ciprofloxacino", "Clopidogrel",
  "Dexametasona", "Digoxina", "Dipirona", "Enoxaparina", "Espironolactona",
  "Furosemida", "Hidroclorotiazida", "Ibuprofeno", "Losartana", "Metformina",
  "Omeprazol", "Paracetamol", "Prednisona", "Sinvastatina", "Varfarina",
  "Ácido Acetilsalicílico", "Atenolol", "Azitromicina", "Bisoprolol",
  "Bromoprida", "Budesonida", "Carvedilol", "Cefalexina", "Ceftriaxona",
  "Cetirizina", "Cimetidina", "Cisatracúrio", "Claritromicina", "Clonazepam",
  "Dapagliflozina", "Diazepam", "Diclofenaco", "Enalapril", "Escitalopram",
  "Fenitoína", "Fluconazol", "Fosfomicina", "Glibenclamida", "Heparina",
  "Ipratrópio", "Isossorbida", "Itraconazol", "Lactulose", "Levetiracetam",
  "Levotiroxina", "Lidocaína", "Loratadina", "Lorazepam", "Mannitol",
  "Meropenem", "Metildopa", "Metoclopramida", "Metoprolol", "Midazolam",
  "Montelucaste", "Morfina", "Nifedipino", "Nistatina", "Nitroprussiato",
  "Norepinefrina", "Norfloxacino", "Ondansetrona", "Oxacilina",
  "Pantoprazol", "Penicilina", "Propofol", "Ranitidina", "Rivaroxabana",
  "Rosuvastatina", "Salbutamol", "Sertralina", "Simeticona", "Sulfametoxazol",
  "Tramadol", "Trimetoprima", "Vancomicina", "Zolpidem",
  "Acetato De Medroxiprogesterona"
];

// 🔑 DICIONÁRIO DE SINÔNIMOS (Agora apontando para o padrão em Português)
export const SINONIMOS: Record<string, string> = {
  "aas": "Ácido Acetilsalicílico", 
  "aspirina": "Ácido Acetilsalicílico",
  "dipirona sodica": "Dipirona",
  "metformina cloridrato": "Metformina",
  "losartana potassica": "Losartana",
  "omeprazol magnesio": "Omeprazol",
  "amoxicilina tri-hidratada": "Amoxicilina",
  "cloridrato de amiodarona": "Amiodarona", // <- ADICIONADO
};

type Info = { 
  severity: Exclude<Severity, "nenhuma" | "semdado">; 
  desc: string; 
  rec: string;
  source: string;
};

const key = (a: string, b: string) => [a, b].sort().join("|");

const RAW: [string, string, Info][] = [
  // ... (O RAW continua EXATAMENTE igual ao seu, sem alterações)
  ["Varfarina", "Ibuprofeno", { severity: "grave", desc: "Risco elevado de sangramento gastrointestinal e sistêmico.", rec: "Evitar associação. Monitorar INR.", source: "Bula FDA (Coumadin)" }],
  ["Varfarina", "Ácido Acetilsalicílico", { severity: "grave", desc: "Risco significativamente aumentado de hemorragia grave.", rec: "Avaliar risco/benefício. Monitorar sinais de sangramento.", source: "Bula FDA + Literatura" }],
  ["Clopidogrel", "Omeprazol", { severity: "grave", desc: "Reduz a concentração do metabólito ativo do clopidogrel, diminuindo a eficácia antiplaquetária.", rec: "Evitar uso concomitante. Preferir pantoprazol.", source: "FDA Drug Safety Communication" }],
  ["Ácido Acetilsalicílico", "Ibuprofeno", { severity: "moderada", desc: "Ibuprofeno pode interferir no efeito antiplaquetário do AAS e aumentar risco gástrico.", rec: "Monitorar. Espaçar administração.", source: "Bula FDA + Literatura" }],
  ["Heparina", "Ácido Acetilsalicílico", { severity: "grave", desc: "Risco aumentado de sangramento.", rec: "Monitorar sinais de sangramento e TTPa.", source: "Bula FDA + Literatura" }],
  ["Digoxina", "Amiodarona", { severity: "grave", desc: "Amiodarona eleva concentração de digoxina, risco de toxicidade digitálica.", rec: "Reduzir dose de digoxina em ~50%. Monitorar níveis.", source: "Bula FDA + Literatura" }],
  ["Digoxina", "Furosemida", { severity: "moderada", desc: "Hipocalemia induzida pela furosemida aumenta risco de toxicidade da digoxina.", rec: "Monitorar potássio e níveis de digoxina.", source: "Bula FDA + Literatura" }],
  ["Digoxina", "Verapamil", { severity: "grave", desc: "Aumenta concentração de digoxina e soma efeitos na condução AV (bradicardia).", rec: "Monitorar níveis de digoxina e FC.", source: "Bula FDA + Literatura" }],
  ["Espironolactona", "Captopril", { severity: "grave", desc: "Risco de hipercalemia grave.", rec: "Monitorar potássio e função renal.", source: "Bula FDA + Literatura" }],
  ["Espironolactona", "Losartana", { severity: "grave", desc: "Risco de hipercalemia grave.", rec: "Monitorar potássio e função renal.", source: "Bula FDA + Literatura" }],
  ["Captopril", "Ibuprofeno", { severity: "moderada", desc: "AINEs reduzem efeito anti-hipertensivo de IECAs e podem precipitar lesão renal.", rec: "Monitorar pressão e função renal.", source: "Bula FDA + Literatura" }],
  ["Losartana", "Ibuprofeno", { severity: "moderada", desc: "AINEs reduzem efeito anti-hipertensivo de BRAs.", rec: "Monitorar pressão arterial.", source: "Literatura Clínica" }],
  ["Claritromicina", "Varfarina", { severity: "grave", desc: "Claritromicina inibe metabolismo da varfarina (CYP3A4), elevando INR.", rec: "Monitorar INR de perto.", source: "Bula FDA + Literatura" }],
  ["Ciprofloxacino", "Varfarina", { severity: "grave", desc: "Fluoroquinolonas potencializam efeito anticoagulante da varfarina.", rec: "Monitorar INR.", source: "Bula FDA + Literatura" }],
  ["Claritromicina", "Sinvastatina", { severity: "grave", desc: "Inibição forte da CYP3A4 eleva níveis de sinvastatina, risco de rabdomiólise.", rec: "Suspender estatina durante antibiótico.", source: "Bula FDA (Zocor)" }],
  ["Fluconazol", "Varfarina", { severity: "grave", desc: "Fluconazol inibe metabolismo da varfarina (CYP2C9), elevando INR.", rec: "Monitorar INR de perto.", source: "Bula FDA + Literatura" }],
  ["Tramadol", "Sertralina", { severity: "grave", desc: "Risco de síndrome serotoninérgica e convulsões.", rec: "Monitorar sinais clínicos (agitação, tremor).", source: "Bula FDA (Ultram)" }],
  ["Morfina", "Midazolam", { severity: "grave", desc: "Depressão aditiva do SNC e respiratória. Risco de sedação profunda.", rec: "Reduzir doses. Monitorar saturação de O2.", source: "Bula FDA (Midazolam)" }],
  ["Amiodarona", "Sinvastatina", { severity: "grave", desc: "Amiodarona eleva níveis de sinvastatina, risco de miopatia.", rec: "Limitar sinvastatina a 20mg/dia ou trocar estatina.", source: "Bula FDA (Zocor)" }],
  ["Metotrexato", "Ibuprofeno", { severity: "grave", desc: "AINEs reduzem eliminação renal do metotrexato, risco de toxicidade.", rec: "Evitar associação em altas doses.", source: "Bula FDA + Literatura" }],
  ["Varfarina", "Dipirona", { severity: "moderada", desc: "Pode aumentar o efeito anticoagulante.", rec: "Monitorar sinais de sangramento.", source: "Literatura Clínica" }],
  ["Dipirona", "Enoxaparina", { severity: "moderada", desc: "Risco de sangramento.", rec: "Observar sangramentos e hematomas.", source: "Literatura Clínica" }],
  ["Ibuprofeno", "Dexametasona", { severity: "moderada", desc: "Risco de úlcera gástrica.", rec: "Considerar protetor gástrico.", source: "Literatura Clínica" }],
  ["Acetato De Medroxiprogesterona", "Varfarina", { severity: "moderada", desc: "Risco aumentado de eventos trombóticos e alteração no efeito anticoagulante.", rec: "Monitorar sinais de trombose e INR.", source: "Literatura Clínica" }],
];

const MAP = new Map(RAW.map(([a, b, i]) => [key(a, b), i]));
const NO_DATA = new Set([key("Amoxicilina", "Metformina"), key("Prednisona", "Sinvastatina")]);

export function getInteraction(a: string, b: string): { severity: Severity; desc: string; rec: string; source?: string } {
  const i = MAP.get(key(a, b));
  if (i) return i;
  if (NO_DATA.has(key(a, b))) return { severity: "semdado", desc: "Sem dados disponíveis.", rec: "Consultar o farmacêutico." };
  
  return { severity: "semdado", desc: "Interação não mapeada.", rec: "Consultar o farmacêutico." };
}

export const interacts = (a: string, b: string) => {
  const s = getInteraction(a, b).severity;
  return s === "grave" || s === "moderada" || s === "leve";
};

// --- LÓGICA DE HORÁRIOS (Mantida intacta) ---
export type Slot = { id: string; minutes: number; meds: string[] };

export const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const fromHHMM = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

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