// src/services/ocr/documentParser.ts
import * as pdfjsLib from "pdfjs-dist";
import { extrairTextoComGroq } from "./groqOcrServer";
import { MEDS, SINONIMOS } from "@/lib/meds";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const strip = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * 🔑 PENEIRA FINA: Usa sinônimos e rejeita qualquer palavra que não seja EXATAMENTE um remédio.
 */
function extrairMedicamentosEstritos(listaBruta: string[]): string[] {
  const medsEncontrados = new Set<string>();
  
  // Normaliza a lista bruta da IA
  const palavrasLimpas = listaBruta.map(p => strip(p));

  palavrasLimpas.forEach(palavra => {
    // 1. Verifica se a palavra é um sinônimo direto (ex: "aas" -> "ácido acetilsalicílico")
    if (SINONIMOS[palavra]) {
      medsEncontrados.add(SINONIMOS[palavra]);
      return;
    }

    // 2. Procura na base oficial
    const match = MEDS.find(med => {
      const medNormalizado = strip(med);
      // Aceita apenas se a palavra for IGUAL ou tiver uma correspondência muito forte
      return palavra === medNormalizado || palavra.includes(medNormalizado);
    });

    if (match) {
      // Garante que não vamos adicionar duplicatas (ex: AAS e Ácido Acetilsalicílico)
      const jaTem = Array.from(medsEncontrados).some(m => strip(m).includes(strip(match)) || strip(match).includes(strip(m)));
      if (!jaTem) medsEncontrados.add(match);
    }
  });

  return Array.from(medsEncontrados);
}

function canvasToBase64(canvas: HTMLCanvasElement): string {
  const MAX_WIDTH = 1200; 
  let width = canvas.width;
  let height = canvas.height;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d");
  ctx?.drawImage(canvas, 0, 0, width, height);
  return tempCanvas.toDataURL("image/jpeg", 0.8).split(",")[1]; 
}

export async function processarDocumento(file: File): Promise<string[]> {
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textoNativoCompleto = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto += textContent.items.map((item: any) => item.str).join(" ") + " ";
    }

    const nativosEncontrados = extrairMedicamentosEstritos(textoNativoCompleto.split(/\s+/));
    
    // Se o PDF nativo encontrou MUITOS remédios (ex: > 15), ele é confiável.
    if (nativosEncontrados.length >= 15) {
      return nativosEncontrados;
    }

    // Usa a IA na imagem se o nativo falhar
    const todosEncontrados = new Set<string>(nativosEncontrados);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); 
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport, canvas: canvas }).promise;
      const base64 = canvasToBase64(canvas);

      try {
        const resultado = await extrairTextoComGroq({ data: { imageBase64: base64 } });
        if (resultado.status === "erro") continue; 

        const achadosPagina = extrairMedicamentosEstritos(resultado.medicamentos || []);
        achadosPagina.forEach((m) => todosEncontrados.add(m));
      } catch (err) {
        console.warn(`[documentParser] Página ${i}: falha na IA`, err);
      }
    }

    if (todosEncontrados.size === 0) throw new Error("Nenhum medicamento encontrado.");
    return Array.from(todosEncontrados);
  }

  // Imagem direta
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  const base64 = await base64Promise;

  const resultado = await extrairTextoComGroq({ data: { imageBase64: base64 } });
  if (resultado.status === "erro") throw new Error(resultado.mensagem);

  const encontrados = extrairMedicamentosEstritos(resultado.medicamentos || []);
  if (encontrados.length === 0) {
    throw new Error("A imagem não possui medicamentos cadastrados na nossa base local.");
  }

  return encontrados;
}