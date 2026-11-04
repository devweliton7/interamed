// src/components/OCRScanner.tsx
import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, ShieldCheck } from "lucide-react";
import { createWorker } from "tesseract.js";
import { MEDS } from "@/lib/meds";

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtract: (meds: string[]) => void;
}

const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function OCRScanner({ isOpen, onClose, onExtract }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setErrorMsg("");

    try {
      const worker = await createWorker("por", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const result = await worker.recognize(file);
      const textoExtraido = result.data.text;
      
      // Encerra o worker imediatamente para limpar a memória e descartar a imagem
      await worker.terminate();

      // Cruzamento com a base local (busca por partes do nome)
      const medsEncontrados = MEDS.filter((med) => {
        const regex = new RegExp(strip(med), "i");
        return regex.test(strip(textoExtraido));
      });

      if (medsEncontrados.length > 0) {
        onExtract(medsEncontrados);
        onClose();
      } else {
        setErrorMsg("Nenhum medicamento da base foi reconhecido. Verifique se a receita está legível.");
      }
    } catch (error) {
      console.error("Erro no OCR:", error);
      setErrorMsg("Falha ao processar a imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#F5F5F7] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        
        <div className="flex justify-between items-center p-6 pb-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
              <ShieldCheck size={20} className="text-black" /> Scanner Seguro
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Processamento 100% local e privado.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-black h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm font-bold text-black">Extraindo texto... {progress}%</p>
              <p className="text-[10px] text-gray-500 font-medium text-center">
                A imagem está sendo processada no seu dispositivo e será descartada agora.
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-black text-white font-bold text-sm transition-transform active:scale-[0.98] shadow-lg shadow-black/10">
                <Camera size={20} /> Fotografar Receita
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white border border-gray-200 text-black font-bold text-sm transition-transform active:scale-[0.98]">
                <Upload size={18} /> Escolher da Galeria
              </button>

              <div className="mt-4 p-4 bg-[#F2F2F7] rounded-xl text-center">
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  <strong>Privacidade Garantida:</strong> A foto não sai do seu celular. O sistema extrai apenas o texto e descarta a imagem instantaneamente.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}