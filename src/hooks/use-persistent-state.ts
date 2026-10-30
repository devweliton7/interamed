import { useState, useEffect } from "react";

export function usePersistentState<T>(key: string, initialValue: T) {
  // Tenta pegar do localStorage na inicialização
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sempre que o estado mudar, salva no localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
}