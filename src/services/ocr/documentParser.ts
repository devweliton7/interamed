// src/services/ocr/documentParser.ts
import * as pdfjsLib from "pdfjs-dist";
import { extrairTextoComGroq } from "./groqOcrServer";
import { MEDS } from "@/lib/meds";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/** Normaliza string: remove acento, minúscula, trim */
const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Filtra a lista bruta contra a base MEDS.
 * ⚠️ Importante: NÃO retorna cedo — acumula tudo que encontrar.
 */
function extrairMedicamentosDoTexto(listaDeMedicamentos: string[]): string[] {
  const medsEncontrados = new Set<string>();

  // Junta tudo numa string única normalizada pra busca por substring
  const texto = listaDeMedicamentos.map(strip).join(" ");

  MEDS.forEach((med) => {
    const medNormalizado = strip(med);
    if (medNormalizado.length < 3) return; // evita falso positivo de nomes curtos
    if (texto.includes(medNormalizado)) {
      medsEncontrados.add(med);
    }
  });

  return Array.from(medsEncontrados);
}

function canvasToBase64(canvas: HTMLCanvasElement): string {
  const MAX_WIDTH = 800;
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

  return tempCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];
}

export async function processarDocumento(file: File): Promise<string[]> {
  // ============================================================
  // CASO 1: PDF
  // ============================================================
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // -------- TENTATIVA 1: texto nativo do PDF --------
    let textoNativoCompleto = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto +=
        textContent.items.map((item: any) => item.str).join(" ") + " ";
    }

    const nativosEncontrados = extrairMedicamentosDoTexto(
      textoNativoCompleto.split(/\s+/)
    );

    // Se o nativo já achou uma quantidade "boa", retorna (economiza IA)
    // Heurística: >= 5 remédios = confiança razoável
    if (nativosEncontrados.length >= 5) {
      return nativosEncontrados;
    }

    // -------- TENTATIVA 2: IA (acumula TODAS as páginas!) --------
    const todosEncontrados = new Set<string>(nativosEncontrados);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;

      const base64 = canvasToBase64(canvas);

      try {
        const resultado = await extrairTextoComGroq({
          data: { imageBase64: base64 },
        });

        if (resultado.status === "erro") {
          // Não joga erro na primeira página — loga e tenta as próximas
          console.warn(
            `[documentParser] Página ${i}: IA retornou erro:`,
            resultado.mensagem
          );
          continue;
        }

        // 🔑 ACUMULA em vez de retornar na primeira página
        const achadosPagina = extrairMedicamentosDoTexto(
          resultado.medicamentos || []
        );
        achadosPagina.forEach((m) => todosEncontrados.add(m));
      } catch (err) {
        console.warn(`[documentParser] Página ${i}: falha na IA`, err);
        // continua pras próximas páginas
      }
    }

    if (todosEncontrados.size === 0) {
      throw new Error(
        "Nenhum medicamento da base foi encontrado nesta receita."
      );
    }

    return Array.from(todosEncontrados);
  }

  // ============================================================
  // CASO 2: Imagem direta (jpg, png, heic via FileReader)
  // ============================================================
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  const base64 = await base64Promise;

  const resultado = await extrairTextoComGroq({
    data: { imageBase64: base64 },
  });

  if (resultado.status === "erro") {
    throw new Error(resultado.mensagem);
  }

  const encontrados = extrairMedicamentosDoTexto(resultado.medicamentos || []);
  if (encontrados.length === 0) {
    throw new Error(
      "A imagem é uma receita, mas os medicamentos não estão no nosso banco de dados."
    );
  }

  return encontrados;
}