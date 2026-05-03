// Hook para detectar e aplicar atualizações do PWA.
import { useEffect, useRef, useState, useCallback } from "react";

type UpdateSWFn = (reloadPage?: boolean) => Promise<void>;

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [checking, setChecking] = useState(false);
  const updateSWRef = useRef<UpdateSWFn | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const needRefreshRef = useRef(false);

  const markNeedRefresh = useCallback(() => {
    needRefreshRef.current = true;
    setNeedRefresh(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Reload automático quando o SW novo assume o controle.
    if ("serviceWorker" in navigator) {
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    }

    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (cancelled) return;
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            markNeedRefresh();
          },
          onRegisteredSW(_swUrl, registration) {
            if (registration) {
              registrationRef.current = registration;
              // Se já existe um SW esperando, há update pendente.
              if (registration.waiting) markNeedRefresh();
              registration.addEventListener("updatefound", () => {
                const sw = registration.installing;
                if (!sw) return;
                sw.addEventListener("statechange", () => {
                  if (sw.state === "installed" && navigator.serviceWorker.controller) {
                    markNeedRefresh();
                  }
                });
              });
              // Verifica updates a cada 60s.
              setInterval(() => {
                registration.update().catch(() => {});
              }, 60_000);
            }
          },
        });
        updateSWRef.current = updateSW as UpdateSWFn;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [markNeedRefresh]);

  /** Força verificação imediata. Retorna true se há nova versão disponível. */
  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    setChecking(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      // Aguarda eventuais callbacks de updatefound/onNeedRefresh.
      await new Promise((r) => setTimeout(r, 1500));
      return needRefreshRef.current;
    } catch {
      return needRefreshRef.current;
    } finally {
      setChecking(false);
    }
  }, []);

  /** Aplica a atualização disponível com hard reload. */
  const applyUpdate = useCallback(async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Avisa o SW em waiting para assumir imediatamente.
      const reg = registrationRef.current;
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      if (updateSWRef.current) {
        await updateSWRef.current(true);
        return;
      }
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("_v", Date.now().toString());
    window.location.replace(url.toString());
  }, []);

  return { needRefresh, checking, checkForUpdate, applyUpdate };
}
