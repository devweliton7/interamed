// src/hooks/useSecureSession.ts
import { useEffect } from "react";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

export function useSecureSession() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Limpa dados sensíveis da sessão
        sessionStorage.removeItem("interamed-selected");
        sessionStorage.removeItem("interamed-query");
        
        // Opcional: Recarregar a página para garantir que o estado React seja limpo
        if (window.location.pathname === "/") {
          window.location.reload();
        }
      }, SESSION_TIMEOUT_MS);
    };

    // Eventos que indicam atividade do usuário
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => document.addEventListener(event, resetTimer));

    resetTimer(); // Inicia o timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, []);
}