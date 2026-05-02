// Exporta/importa todos os dados do app salvos em localStorage.
// Inclui chaves globais "d21.*" e por usuário "u:<email>:*".
import { toast } from "sonner";

export interface BackupPayload {
  app: "money-mind-21d";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

const KEY_RX = /^(d21\.|u:|nome_completo|email_usuario|primeiro_nome|onboarding_completed)/;

export function collectLocalData(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (!KEY_RX.test(k)) continue;
    const v = localStorage.getItem(k);
    if (v != null) out[k] = v;
  }
  return out;
}

export function exportData() {
  const payload: BackupPayload = {
    app: "money-mind-21d",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: collectLocalData(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `money-mind-21d-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file: File, mode: "merge" | "replace" = "merge") {
  const text = await file.text();
  let parsed: BackupPayload;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Arquivo inválido (não é JSON).");
  }
  if (!parsed || parsed.app !== "money-mind-21d" || !parsed.data) {
    throw new Error("Arquivo de backup não reconhecido.");
  }
  if (mode === "replace") {
    // remove apenas as chaves do app
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && KEY_RX.test(k)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
  let count = 0;
  Object.entries(parsed.data).forEach(([k, v]) => {
    if (typeof v === "string") {
      localStorage.setItem(k, v);
      count++;
    }
  });
  return count;
}

export function importDataPicker(mode: "merge" | "replace" = "merge") {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const count = await importDataFromFile(file, mode);
      toast.success(`${count} item(ns) importados.`, {
        description: "A página será recarregada para aplicar os dados.",
      });
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      toast.error((e as Error).message || "Falha ao importar.");
    }
  };
  input.click();
}
