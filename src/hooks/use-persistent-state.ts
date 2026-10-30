import { useState, useEffect } from "react";

export function usePersistentState<T>(key: string, initialValue: T) {
  // 1. Inicia com o valor padrão (seguro para o servidor)
  const [state, setState] = useState<T>(initialValue);

  // 2. Só tenta ler o localStorage quando estiver no navegador (client-side)
  useEffect(() => {
    if (typeof window === "undefined") return; // Previne erro no servidor da Vercel

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
    }
  }, [key]);

  // 3. Salva no localStorage apenas quando o estado muda e estamos no navegador
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
}