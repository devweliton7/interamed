// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { MEDS } from '@/lib/meds';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Função robusta de extração
function extrairMedicamentosDoTexto(textoBruto: string): string[] {
  // Limpa quebras de linha estranhas e pontuações
  const textoLimpo = textoBruto.replace(/\n/g, " ").replace(/[.,;:]/g, " ");
  const palavras = textoLimpo.split(/\s+/);
  
  const medsEncontrados = new Set<string>();

  // Para cada medicamento da nossa base, verifica se alguma palavra do texto bate
  MEDS.forEach((med) => {
    const medNormalizado = strip(med);
    
    // Verifica se a palavra exata existe no texto
    const encontrouExato = palavras.some(p => strip(p) === medNormalizado);
    
    // Verifica se a palavra do medicamento está contida em alguma palavra do texto (ex: "Losartana50mg")
    const encontrouParcial = palavras.some(p => strip(p).includes(medNormalizado));

    if (encontrouExato || encontrouParcial) {
      medsEncontrados.add(med);
    }
  });

  return Array.from(medsEncontrados);
}

export async function processarDocumento(file: File): Promise<string[]> {
  const medicamentosFinais = new Set<string>();

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    // 1. Tenta extrair texto nativo
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      textoNativoCompleto += pageText + ' ';
    }

    // Se for PDF nativo com texto bom, usa direto (MUITO MAIS RÁPIDO)
    if (textoNativoCompleto.trim().length > 100) {
       extrairMedicamentosDoTexto(textoNativoCompleto).forEach(m => medicamentosFinais.add(m));
    } else {
      // Se for PDF escaneado, faz OCR (mais lento)
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Reduzido de 2.0 para 1.5 para otimizar a memória do celular
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport }).promise;
        
        // Tesseract com configuração mais leve
        const { data: { text } } = await Tesseract.recognize(canvas, 'por', {
            // Desativa logs desnecessários
        });
        extrairMedicamentosDoTexto(text).forEach(m => medicamentosFinais.add(m));
      }
    }
  } else {
    // Imagem (JPG/PNG)
    const { data: { text } } = await Tesseract.recognize(file, 'por');
    extrairMedicamentosDoTexto(text).forEach(m => medicamentosFinais.add(m));
  }

  return Array.from(medicamentosFinais);
}