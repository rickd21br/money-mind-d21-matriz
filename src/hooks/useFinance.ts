import { useMemo, useCallback } from "react";
import { Transaction, User, TransactionType, CATEGORY_CATALOG, Goal } from "@/types";
import { useStorage } from "./useStorage";

type CustomCats = Record<TransactionType, Record<string, string[]>>;
const EMPTY_CUSTOM: CustomCats = { income: {}, expense: {} };

export function useCategories() {
  const [custom, setCustom] = useStorage<CustomCats>("d21.customCategories", EMPTY_CUSTOM);

  const getGroups = useCallback((type: TransactionType) => {
    const base = Object.keys(CATEGORY_CATALOG[type]);
    const extra = Object.keys(custom[type] ?? {}).filter((g) => !base.includes(g));
    return [...base, ...extra];
  }, [custom]);

  const getCategories = useCallback((type: TransactionType, group: string) => {
    const base = CATEGORY_CATALOG[type]?.[group] ?? [];
    const extra = custom[type]?.[group] ?? [];
    const merged = [...base];
    extra.forEach((c) => { if (!merged.includes(c)) merged.push(c); });
    return merged;
  }, [custom]);

  const addCategory = useCallback((type: TransactionType, group: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustom((prev) => {
      const groupCats = prev[type]?.[group] ?? [];
      const baseCats = CATEGORY_CATALOG[type]?.[group] ?? [];
      if (groupCats.includes(trimmed) || baseCats.includes(trimmed)) return prev;
      return {
        ...prev,
        [type]: { ...prev[type], [group]: [...groupCats, trimmed] },
      };
    });
  }, [setCustom]);

  /** Categorias obrigatórias (do catálogo) NÃO podem ser editadas/removidas. */
  const isCustomCategory = useCallback((type: TransactionType, group: string, name: string) => {
    const base = CATEGORY_CATALOG[type]?.[group] ?? [];
    if (base.includes(name)) return false;
    return (custom[type]?.[group] ?? []).includes(name);
  }, [custom]);

  const removeCategory = useCallback((type: TransactionType, group: string, name: string) => {
    setCustom((prev) => {
      const list = prev[type]?.[group] ?? [];
      if (!list.includes(name)) return prev;
      return {
        ...prev,
        [type]: { ...prev[type], [group]: list.filter((c) => c !== name) },
      };
    });
  }, [setCustom]);

  const renameCategory = useCallback((type: TransactionType, group: string, oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setCustom((prev) => {
      const list = prev[type]?.[group] ?? [];
      if (!list.includes(oldName)) return prev;
      const base = CATEGORY_CATALOG[type]?.[group] ?? [];
      if (list.includes(trimmed) || base.includes(trimmed)) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          [group]: list.map((c) => (c === oldName ? trimmed : c)),
        },
      };
    });
  }, [setCustom]);

  return { getGroups, getCategories, addCategory, isCustomCategory, removeCategory, renameCategory };
}

export function useTransactions() {
  const [transactions, setTransactions] = useStorage<Transaction[]>("d21.transactions", []);

  const addTransaction = useCallback((tx: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, [setTransactions]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [setTransactions]);

  const updateTransaction = useCallback((id: string, patch: Partial<Omit<Transaction, "id" | "createdAt">>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, [setTransactions]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return { transactions, addTransaction, removeTransaction, updateTransaction, totals };
}

export function useGoals() {
  const [goals, setGoals] = useStorage<Goal[]>("d21.goals", []);

  const addGoal = useCallback((g: Omit<Goal, "id" | "createdAt">) => {
    const goal: Goal = { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setGoals((prev) => [goal, ...prev]);
    return goal;
  }, [setGoals]);

  const updateGoal = useCallback((id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }, [setGoals]);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, [setGoals]);

  /** Aporte rápido — soma valor ao "saved". */
  const contribute = useCallback((id: string, amount: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g)));
  }, [setGoals]);

  return { goals, addGoal, updateGoal, removeGoal, contribute };
}

export function useJourney() {
  const [completed, setCompleted] = useStorage<number[]>("d21.journey", []);

  const toggleDay = useCallback((day: number) => {
    setCompleted((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }, [setCompleted]);

  const isCompleted = useCallback((day: number) => completed.includes(day), [completed]);

  return { completed, toggleDay, isCompleted, progress: completed.length };
}

export function useUser() {
  const [user, setUser] = useStorage<User>("d21.user", { name: "Visitante", email: "" });
  return { user, setUser };
}

import { getCurrencyOption } from "./useCurrency";
import { scopedKey } from "./useSession";

/**
 * Formata um valor usando a moeda do usuário ativo.
 * Lê direto do localStorage para refletir a escolha global em tempo real.
 */
export const formatCurrency = (value: number) => {
  let code = "BRL";
  try {
    const raw = localStorage.getItem(scopedKey("d21.currency"));
    if (raw) code = JSON.parse(raw) as string;
  } catch { /* ignore */ }
  const opt = getCurrencyOption(code);
  return value.toLocaleString(opt.locale, { style: "currency", currency: opt.code });
};
