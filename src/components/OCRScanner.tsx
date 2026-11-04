// src/components/OCRScanner.tsx
import { useState, useRef, useEffect, useCallback } from "react";
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
  
  // Estados da Câmera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false); // Novo estado para o iOS
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, []);

  useEffect(() => {
    if (!isOpen) stopCamera();
    return () => stopCamera();
  }, [isOpen, stopCamera]);

  const startCamera = async () => {
    setIsCameraActive(true); // 1. Renderiza o <video> PRIMEIRO (Obrigatório para o iOS)
    setIsVideoReady(false);
    setErrorMsg("");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      
      streamRef.current = mediaStream;
      
      // 2. Só atribui o stream se o vídeo já estiver na tela
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setErrorMsg("Não foi possível acessar a câmera. Verifique as permissões no navegador.");
      setIsCameraActive(false);
    }
  };

  // Otimização de Imagem (Redimensionamento)
  const optimizeImage = (source: HTMLVideoElement | HTMLImageElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas não suportado");

      let width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
      let height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

      const MAX_WIDTH = 1200;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(source, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Falha ao converter imagem");
        },
        "image/jpeg",
        0.85
      );
    });
  };

  const processImage = async (imageSource: Blob | File) => {
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

      const result = await worker.recognize(imageSource);
      const textoExtraido = result.data.text;
      
      await worker.terminate();

      const medsEncontrados = MEDS.filter((med) => {
        const regex = new RegExp(strip(med), "i");
        return regex.test(strip(textoExtraido));
      });

      if (medsEncontrados.length > 0) {
        onExtract(medsEncontrados);
        onClose();
      } else {
        setErrorMsg("Nenhum medicamento da base foi reconhecido. Tente uma foto mais nítida.");
      }
    } catch (error) {
      console.error("Erro no OCR:", error);
      setErrorMsg("Falha ao processar a imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !isVideoReady) return; // Só captura se o vídeo estiver rodando de verdade
    
    try {
      const optimizedBlob = await optimizeImage(videoRef.current);
      stopCamera();
      processImage(optimizedBlob);
    } catch (err) {
      console.error("Erro ao capturar:", err);
      setErrorMsg("Falha ao capturar a imagem.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      try {
        const optimizedBlob = await optimizeImage(img);
        processImage(optimizedBlob);
      } catch (err) {
        processImage(file);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#F5F5F7] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 pb-2 shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
              <ShieldCheck size={20} className="text-black" /> Scanner Seguro
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Processamento 100% local.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-black h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm font-bold text-black">Extraindo texto... {progress}%</p>
            </div>
          ) : isCameraActive ? (
            /* TELA DA CÂMERA - O vídeo é renderizado imediatamente */
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                {!isVideoReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 z-10">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-medium">Ligando câmera...</span>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  onCanPlay={() => setIsVideoReady(true)} // Gatilho de sucesso do iOS
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {isVideoReady && (
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none m-4 border-dashed" />
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={stopCamera} className="flex-1 py-4 rounded-xl bg-white border border-gray-200 text-black font-bold text-sm active:scale-95 transition-transform">
                  Cancelar
                </button>
                <button 
                  onClick={capturePhoto} 
                  disabled={!isVideoReady}
                  className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm shadow-lg transition-all ${
                    isVideoReady ? 'bg-black text-white active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Camera size={20} /> Capturar
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <button onClick={startCamera} className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-black text-white font-bold text-sm transition-transform active:scale-[0.98] shadow-lg shadow-black/10">
                <Camera size={20} /> Abrir Câmera
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white border border-gray-200 text-black font-bold text-sm transition-transform active:scale-[0.98]">
                <Upload size={18} /> Escolher da Galeria / Drive
              </button>

              <div className="mt-4 p-4 bg-[#F2F2F7] rounded-xl text-center">
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  <strong>Privacidade Garantida:</strong> A foto não sai do seu celular. O sistema extrai apenas o texto e descarta a imagem.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}