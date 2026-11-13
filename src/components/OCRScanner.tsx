// src/components/OCRScanner.tsx
import { useState, useRef, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { processarDocumento } from "../services/ocr/documentParser";

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtract: (meds: string[]) => void;
}

export function OCRScanner({ isOpen, onClose, onExtract }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          await processFile(file);
        }
      }, "image/jpeg", 0.9);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null); 
    }

    try {
      const medicamentos = await processarDocumento(file);
      onExtract(medicamentos);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Falha ao processar o documento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setError(null);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 safe-area-top safe-area-bottom backdrop-blur-md">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-white text-lg font-bold">Escanear Receita</h2>
        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden mx-4 rounded-3xl border-2 border-white/20 border-dashed">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold">Analisando com IA...</p>
            <p className="text-xs text-gray-300 mt-1">Identificando medicamentos</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      <div className="p-6 flex justify-center items-center gap-8">
        <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-colors">
          <ImageIcon size={24} />
        </button>
        <button onClick={capturePhoto} disabled={isProcessing || !!preview} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 transition-transform active:scale-90">
          <div className="w-16 h-16 border-4 border-black rounded-full" />
        </button>
        <div className="w-14" />
      </div>

      <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
    </div>
  );
}