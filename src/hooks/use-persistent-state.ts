import { useState, useEffect } from "react";

export function usePersistentState<T>(key: string, initialValue: T) {
  // 1. No servidor e no primeiro render do cliente, inicia com o valor padrão.
  // NUNCA tente acessar window/localStorage aqui, senão quebra o SSR da Vercel.
  const [state, setState] = useState<T>(initialValue);

  // 2. Após a montagem no navegador, busca o valor real salvo.
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
    }
  }, [key]);

  // 3. Sempre que o estado mudar no navegador, salva.
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