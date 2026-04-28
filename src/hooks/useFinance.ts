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

  return { getGroups, getCategories, addCategory };
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

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return { transactions, addTransaction, removeTransaction, totals };
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

export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
