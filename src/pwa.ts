// Registro do Service Worker do PWA.
// Regras:
//  - Nunca registra dentro de iframes (preview do Lovable usa iframe).
//  - Nunca registra em hosts de preview do Lovable.
//  - Em hosts de preview/iframe, faz unregister de SWs já existentes
//    para evitar cache antigo "preso".
//  - Só registra de fato no app publicado / dispositivo do usuário.

export function registerPWA() {
  if (typeof window === "undefined") return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  // Em preview/iframe: limpa qualquer SW antigo + caches e sai.
  if (isPreviewHost || isInIframe) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {
          /* ignore */
        });
    }
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
    return;
  }

  // App publicado em domínio real: registra o SW gerado pelo vite-plugin-pwa.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // O virtual module é injetado pelo vite-plugin-pwa em produção.
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          registerSW({ immediate: true });
        })
        .catch(() => {
          /* ignore se o módulo não existir (ex: dev) */
        });
    });
  }
}
