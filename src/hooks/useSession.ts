// Sessão local multi-usuário.
// Cada email tem seu próprio "namespace" no localStorage via prefixo "u:<email>:".
// Isso permite que vários alunos usem o mesmo link e mantenham dados separados.

const ACTIVE_KEY = "d21.activeUser";

export function getActiveEmail(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) || "";
  } catch {
    return "";
  }
}

export function setActiveEmail(email: string) {
  try {
    if (email) localStorage.setItem(ACTIVE_KEY, email.toLowerCase().trim());
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Prefixa a chave de armazenamento com o email do usuário ativo.
 * Chaves "globais" (ex.: ACTIVE_KEY, d21.activeUser) ficam sem prefixo.
 */
export function scopedKey(key: string): string {
  // Algumas chaves devem permanecer globais
  if (key === ACTIVE_KEY) return key;
  const email = getActiveEmail();
  if (!email) return key; // fallback (pré-onboarding)
  return `u:${email}:${key}`;
}

/** Logout: apenas marca sessão como saída — preserva dados do usuário. */
export function endSession() {
  try {
    localStorage.removeItem(ACTIVE_KEY);
    // Sinaliza para guards reabrirem onboarding
    localStorage.removeItem("d21.onboarded");
    localStorage.removeItem("onboarding_completed");
  } catch {
    /* ignore */
  }
}
