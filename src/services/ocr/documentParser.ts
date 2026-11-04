// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { extrairTextoComGroq } from './groqOcrServer';
import { MEDS } from '@/lib/meds';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Limpeza agressiva do texto para isolar os medicamentos
function extrairMedicamentosDoTexto(textoBruto: string): string[] {
  // Remove tudo que não for letra ou espaço
  const apenasLetras = textoBruto.replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ');
  const palavras = apenasLetras.split(/\s+/).filter(p => p.length > 3);
  const medsEncontrados = new Set<string>();

  MEDS.forEach((med) => {
    const medNormalizado = strip(med);
    if (palavras.some(p => strip(p).includes(medNormalizado))) {
      medsEncontrados.add(med);
    }
  });

  return Array.from(medsEncontrados);
}

function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
}

export async function processarDocumento(file: File): Promise<string[]> {
  const medicamentosFinais = new Set<string>();

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }

    // Se o texto for grande, tenta extrair via PDF.js primeiro
    if (textoNativoCompleto.trim().length > 100) {
       extrairMedicamentosDoTexto(textoNativoCompleto).forEach(m => medicamentosFinais.add(m));
    } 
    
    // Se não achou nada (ou se é PDF escaneado), joga pra IA
    if (medicamentosFinais.size < 5) {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport }).promise;
        
        const base64 = canvasToBase64(canvas);
        const { texto } = await extrairTextoComGroq({ data: { imageBase64: base64 } });
        extrairMedicamentosDoTexto(texto).forEach(m => medicamentosFinais.add(m));
      }
    }
  } else {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;
    
    const { texto } = await extrairTextoComGroq({ data: { imageBase64: base64 } });
    extrairMedicamentosDoTexto(texto).forEach(m => medicamentosFinais.add(m));
  }

  return Array.from(medicamentosFinais);
}