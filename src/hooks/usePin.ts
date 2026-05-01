// Gestão local do PIN de acesso rápido por usuário (escopado por email).
// Armazena hash simples (não é criptografia forte — é proteção UX/MVP).
// Quando o backend real chegar, substituiremos por verificação server-side.

const PIN_KEY_PREFIX = "u:"; // u:<email>:d21.pin
const LAST_EMAIL_KEY = "d21.lastPinEmail"; // último email que cadastrou PIN (para login rápido)

const hashPin = (pin: string, email: string): string => {
  // hash leve e determinístico (djb2-ish + email salt)
  const salted = `${email.toLowerCase()}::${pin}`;
  let h = 5381;
  for (let i = 0; i < salted.length; i++) {
    h = (h * 33) ^ salted.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
};

const keyFor = (email: string) => `${PIN_KEY_PREFIX}${email.toLowerCase().trim()}:d21.pin`;

export function hasPinFor(email: string): boolean {
  if (!email) return false;
  try {
    return !!localStorage.getItem(keyFor(email));
  } catch {
    return false;
  }
}

/** Existe ALGUM PIN cadastrado neste dispositivo? */
export function hasAnyPin(): boolean {
  try {
    return !!localStorage.getItem(LAST_EMAIL_KEY);
  } catch {
    return false;
  }
}

export function getLastPinEmail(): string {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function savePin(email: string, pin: string) {
  if (!email || !/^\d{4}$/.test(pin)) return;
  try {
    localStorage.setItem(keyFor(email), hashPin(pin, email));
    localStorage.setItem(LAST_EMAIL_KEY, email.toLowerCase().trim());
  } catch {
    /* ignore */
  }
}

export function verifyPin(email: string, pin: string): boolean {
  if (!email || !/^\d{4}$/.test(pin)) return false;
  try {
    const stored = localStorage.getItem(keyFor(email));
    return !!stored && stored === hashPin(pin, email);
  } catch {
    return false;
  }
}

export function removePin(email: string) {
  if (!email) return;
  try {
    localStorage.removeItem(keyFor(email));
    if (getLastPinEmail() === email.toLowerCase().trim()) {
      localStorage.removeItem(LAST_EMAIL_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Lê os dados salvos do usuário (nome/email) para login automático via PIN. */
export function getUserDataByEmail(email: string): { name: string; email: string } | null {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(`u:${email.toLowerCase().trim()}:d21.user`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
