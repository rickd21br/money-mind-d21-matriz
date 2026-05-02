// Hook para detectar e aplicar atualizações do PWA.
// Funciona tanto no app instalado quanto no navegador.
import { useEffect, useRef, useState, useCallback } from "react";

type UpdateSWFn = (reloadPage?: boolean) => Promise<void>;

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [checking, setChecking] = useState(false);
  const updateSWRef = useRef<UpdateSWFn | null>(null);

  useEffect(() => {
    // Só registra de fato em produção / app real (o pwa.ts já cuida do iframe).
    let cancelled = false;
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (cancelled) return;
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onRegisteredSW(_swUrl, registration) {
            // Verifica updates a cada 60s enquanto app aberto.
            if (registration) {
              setInterval(() => {
                registration.update().catch(() => {});
              }, 60_000);
            }
          },
        });
        updateSWRef.current = updateSW as UpdateSWFn;
      })
      .catch(() => {
        /* virtual module ausente em dev — ok */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Força verificação imediata de atualização. */
  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      // Pequeno delay para o onNeedRefresh disparar caso haja nova versão.
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      /* ignore */
    } finally {
      setChecking(false);
    }
  }, []);

  /** Aplica a atualização disponível. Se não houver SW, força reload limpando cache. */
  const applyUpdate = useCallback(async () => {
    try {
      // Limpa caches antes de recarregar para garantir build novo.
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (updateSWRef.current) {
        await updateSWRef.current(true);
        return;
      }
    } catch {
      /* ignore */
    }
    // Fallback: hard reload com cache-bust.
    const url = new URL(window.location.href);
    url.searchParams.set("_v", Date.now().toString());
    window.location.replace(url.toString());
  }, []);

  return { needRefresh, checking, checkForUpdate, applyUpdate };
}
