// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { extrairTextoComGroq } from './groqOcrServer';
import { MEDS } from '@/lib/meds';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function extrairMedicamentosDoTexto(listaDeMedicamentos: string[]): string[] {
  const medsEncontrados = new Set<string>();

  MEDS.forEach((med) => {
    const medNormalizado = strip(med);
    if (listaDeMedicamentos.some(item => strip(item).includes(medNormalizado))) {
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
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    // 1. Tenta ler o texto nativo do PDF
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }

    if (textoNativoCompleto.trim().length > 100) {
       const encontrados = extrairMedicamentosDoTexto(textoNativoCompleto.split(/\s+/));
       if (encontrados.length > 0) return encontrados;
    }

    // 2. Se falhar, usa a IA
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); 
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;
      
      const base64 = canvasToBase64(canvas);
      const resultado = await extrairTextoComGroq({ data: { imageBase64: base64 } });
      
      if (resultado.status === "erro") {
        throw new Error(resultado.mensagem); // Repassa o erro amigável para a tela
      }

      const encontrados = extrairMedicamentosDoTexto(resultado.medicamentos || []);
      if (encontrados.length > 0) return encontrados;
    }
    throw new Error("Nenhum medicamento da base foi encontrado nesta receita.");

  } else {
    // 3. É uma imagem direta
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;
    
    const resultado = await extrairTextoComGroq({ data: { imageBase64: base64 } });
    
    if (resultado.status === "erro") {
      throw new Error(resultado.mensagem);
    }

    const encontrados = extrairMedicamentosDoTexto(resultado.medicamentos || []);
    if (encontrados.length === 0) {
       throw new Error("A imagem é uma receita, mas os medicamentos não estão no nosso banco de dados.");
    }
    
    return encontrados;
  }
}