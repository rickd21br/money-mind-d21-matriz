import { useMemo, useCallback } from "react";
import { Transaction, User } from "@/types";
import { useStorage } from "./useStorage";

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
