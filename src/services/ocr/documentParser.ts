// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { MEDS } from '@/lib/meds';

// Configuração do Worker do PDF.js (necessário para funcionar no Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Função auxiliar para cruzar o texto bruto com a nossa base de dados
function extrairMedicamentosDoTexto(texto: string): string[] {
  const medsEncontrados = MEDS.filter((med) => {
    const regex = new RegExp(`\\b${strip(med)}\\b`, "i");
    return regex.test(strip(texto));
  });
  return medsEncontrados;
}

export async function processarDocumento(file: File): Promise<string[]> {
  const medicamentosFinais = new Set<string>();

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    // 1. Tenta extrair texto nativo (PDFs gerados por sistemas)
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      textoNativoCompleto += pageText + ' ';
    }

    // Se o texto for muito curto, é um PDF escaneado (foto). Precisamos fazer OCR.
    if (textoNativoCompleto.trim().length < 50) {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Aumenta resolução para o OCR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport }).promise;
        
        const { data: { text } } = await Tesseract.recognize(canvas, 'por');
        extrairMedicamentosDoTexto(text).forEach(m => medicamentosFinais.add(m));
      }
    } else {
      // Se o texto nativo for bom, usa ele direto
      extrairMedicamentosDoTexto(textoNativoCompleto).forEach(m => medicamentosFinais.add(m));
    }
  } else {
    // É uma imagem (JPG/PNG)
    const { data: { text } } = await Tesseract.recognize(file, 'por');
    extrairMedicamentosDoTexto(text).forEach(m => medicamentosFinais.add(m));
  }

  return Array.from(medicamentosFinais);
}