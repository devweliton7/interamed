// src/services/ocr/documentParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { extrairTextoComGroq } from './groqOcrServer';
import { MEDS } from '@/lib/meds';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Função de extração robusta e direta
function extrairMedicamentosDoTexto(textoBruto: string): string[] {
  // Se a IA retornou uma lista separada por \n, isso já está limpo.
  const linhas = textoBruto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const medsEncontrados = new Set<string>();

  MEDS.forEach((med) => {
    const medNormalizado = strip(med);
    // Verifica se o nome do medicamento está em alguma das linhas retornadas
    if (linhas.some(linha => strip(linha).includes(medNormalizado))) {
      medsEncontrados.add(med);
    }
  });

  return Array.from(medsEncontrados);
}

// Otimização: Reduz a imagem para 800px e qualidade 0.6 para não pesar na Groq
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
  const medicamentosFinais = new Set<string>();

  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoNativoCompleto = '';

    // 1. Tenta ler o texto nativo do PDF (Rápido e Grátis)
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textoNativoCompleto += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }

    // 2. Aplica a extração no texto nativo
    if (textoNativoCompleto.trim().length > 100) {
       extrairMedicamentosDoTexto(textoNativoCompleto).forEach(m => medicamentosFinais.add(m));
    }

    // 3. Se a leitura nativa foi falha (achou menos de 20 remédios), usa a IA (Groq)
    if (medicamentosFinais.size < 20) {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport }).promise;
        
        const base64 = canvasToBase64(canvas); // Passa pelo otimizador
        const { texto } = await extrairTextoComGroq({ data: { imageBase64: base64 } });
        extrairMedicamentosDoTexto(texto).forEach(m => medicamentosFinais.add(m));
      }
    }
  } else {
    // 4. É uma imagem direta (JPG/PNG)
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