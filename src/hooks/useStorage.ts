import { useState, useEffect, useCallback, useRef } from "react";

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
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return initialRef.current;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  });

  // Persiste e notifica outras instâncias na mesma aba.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  // Ouve atualizações de outras instâncias (mesma aba) e do evento storage (entre abas).
  useEffect(() => {
    const onLocal: Listener = (v) => setValueState(v as T);
    const unsubscribe = subscribe(key, onLocal);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        setValueState(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const setValue = useCallback<typeof setValueState>(
    (next) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        // Notifica as outras instâncias com o valor resolvido.
        emit(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  const reset = useCallback(() => setValue(initialRef.current), [setValue]);

  return [value, setValue, reset] as const;
}
