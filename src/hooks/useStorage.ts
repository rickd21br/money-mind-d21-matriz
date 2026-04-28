import { useState, useEffect, useCallback, useRef } from "react";
import { scopedKey } from "./useSession";

// Event-bus para sincronizar todas as instâncias de useStorage com a mesma key
// (mesma aba) — o evento `storage` nativo só dispara entre abas diferentes.
type Listener = (value: unknown) => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string, value: unknown) {
  listeners.get(key)?.forEach((cb) => {
    try {
      cb(value);
    } catch {
      /* ignore */
    }
  });
}

function subscribe(key: string, cb: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(cb);
  return () => {
    listeners.get(key)?.delete(cb);
  };
}

export function useStorage<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);
  const resolveKey = () => scopedKey(key);
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return initialRef.current;
    try {
      const raw = localStorage.getItem(resolveKey());
      return raw ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  });

  // Persiste e notifica outras instâncias na mesma aba.
  useEffect(() => {
    try {
      localStorage.setItem(resolveKey(), JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  // Ouve atualizações de outras instâncias (mesma aba) e do evento storage (entre abas).
  useEffect(() => {
    const sk = resolveKey();
    const onLocal: Listener = (v) => setValueState(v as T);
    const unsubscribe = subscribe(sk, onLocal);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== sk || e.newValue == null) return;
      try {
        setValueState(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);

    // Quando o usuário ativo muda, recarrega o valor sob o novo namespace.
    const onSessionChange = () => {
      try {
        const raw = localStorage.getItem(resolveKey());
        setValueState(raw ? (JSON.parse(raw) as T) : initialRef.current);
      } catch {
        setValueState(initialRef.current);
      }
    };
    window.addEventListener("d21:session-change", onSessionChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("d21:session-change", onSessionChange);
    };
  }, [key]);

  const setValue = useCallback<typeof setValueState>(
    (next) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        // Notifica as outras instâncias com o valor resolvido.
        emit(resolveKey(), resolved);
        return resolved;
      });
    },
    [key]
  );

  const reset = useCallback(() => setValue(initialRef.current), [setValue]);

  return [value, setValue, reset] as const;
}
