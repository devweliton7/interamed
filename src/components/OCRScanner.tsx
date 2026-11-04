// src/components/OCRScanner.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, X, Loader2, ShieldCheck, FileText } from "lucide-react";
import { processarDocumento } from "../services/ocr/documentParser";

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtract: (meds: string[]) => void;
}

export function OCRScanner({ isOpen, onClose, onExtract }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, []);

  useEffect(() => {
    if (!isOpen) stopCamera();
    return () => stopCamera();
  }, [isOpen, stopCamera]);

  const startCamera = async () => {
    setIsCameraActive(true);
    setIsVideoReady(false);
    setErrorMsg("");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setErrorMsg("Não foi possível acessar a câmera.");
      setIsCameraActive(false);
    }
  };

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMsg("Lendo documento...");
    setErrorMsg("");

    try {
      const medsEncontrados = await processarDocumento(file);

      if (medsEncontrados.length > 0) {
        onExtract(medsEncontrados);
        onClose();
      } else {
        setErrorMsg("Nenhum medicamento da base foi reconhecido.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Falha ao processar o documento.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !isVideoReady) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          stopCamera();
          const file = new File([blob], "receita.jpg", { type: "image/jpeg" });
          handleProcessFile(file);
        }
      }, "image/jpeg", 0.85);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#F5F5F7] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 pb-2 shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
              <ShieldCheck size={20} className="text-black" /> Scanner de Receitas
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Processamento 100% local e seguro.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-black">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <p className="text-sm font-bold text-black">{statusMsg}</p>
              <p className="text-[10px] text-gray-500 font-medium text-center max-w-[250px]">
                Extraindo texto e identificando medicamentos. Aguarde...
              </p>
            </div>
          ) : isCameraActive ? (
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                {!isVideoReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 z-10">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  </div>
                )}
                <video 
                  ref={videoRef} autoPlay playsInline muted 
                  onCanPlay={() => setIsVideoReady(true)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={stopCamera} className="flex-1 py-4 rounded-xl bg-white border border-gray-200 text-black font-bold text-sm">Cancelar</button>
                <button onClick={capturePhoto} disabled={!isVideoReady} className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm shadow-lg ${isVideoReady ? 'bg-black text-white' : 'bg-gray-300 text-gray-500'}`}>
                  <Camera size={20} /> Capturar
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium text-center">{errorMsg}</div>}
              
              <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }} />
              
              <button onClick={startCamera} className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-black text-white font-bold text-sm shadow-lg">
                <Camera size={20} /> Tirar Foto
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white border border-gray-200 text-black font-bold text-sm">
                <FileText size={18} /> Enviar PDF ou Imagem
              </button>

              <div className="mt-4 p-4 bg-[#F2F2F7] rounded-xl text-center">
                <p className="text-[10px] text-gray-500 font-medium">Suporta PDFs nativos, PDFs escaneados e fotos.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}