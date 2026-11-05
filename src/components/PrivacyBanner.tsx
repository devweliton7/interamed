// src/components/PrivacyBanner.tsx
import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou o aviso nesta sessão
    const hasSeen = sessionStorage.getItem("interamed-privacy-seen");
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("interamed-privacy-seen", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10">
      <div className="mx-auto max-w-md bg-black text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3">
        <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-[11px] font-bold leading-relaxed">
            <strong className="text-emerald-400">Privacidade Garantida (LGPD)</strong><br/>
            Este é um ambiente demonstrativo. Nenhum dado real de paciente é processado ou armazenado em nossos servidores. Sua sessão é local e será apagada ao fechar o navegador.
          </p>
        </div>
        <button onClick={handleDismiss} className="p-1 hover:bg-gray-800 rounded-full">
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}