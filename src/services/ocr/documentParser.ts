// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { extrairTextoComGroq } from './groqOcrServer';
import { MEDS } from '@/lib/meds';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function extrairMedicamentosDoTexto(textoBruto: string): string[] {
  const textoLimpo = textoBruto.replace(/\n/g, " ").replace(/[.,;:]/g, " ");
  const palavras = textoLimpo.split(/\s+/);
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
  // Reduzimos a qualidade para 0.7 para não estourar o limite da Vercel (4.5MB)
  return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
}

export async function processarDocumento(file: File): Promise<string[]> {
  const medicamentosFinais = new Set<string>();

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    // 1. Tenta ler o texto nativo (se for PDF de sistema, é instantâneo)
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }

    if (textoNativoCompleto.trim().length > 100) {
       extrairMedicamentosDoTexto(textoNativoCompleto).forEach(m => medicamentosFinais.add(m));
    } else {
      // 2. Se for PDF escaneado, envia as páginas para a IA
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
    // 3. Se for imagem (JPG/PNG)
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