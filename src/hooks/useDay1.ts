import { useMemo, useCallback, useEffect } from "react";
import { useStorage } from "./useStorage";
import { useTransactions, useJourney } from "./useFinance";

export interface Day1Snapshot {
  hasToday: number;
  debt: number;
  savedAt: string;
}

export interface Day1State {
  snapshot: Day1Snapshot | null;
  startedAt: string | null;
  baselineTxIds: string[]; // transactions that already existed when Day 1 started
  shownCards: string[]; // ids of dynamic cards already shown
  xp: number;
  completed: boolean;
}

const DEFAULT_STATE: Day1State = {
  snapshot: null,
  startedAt: null,
  baselineTxIds: [],
  shownCards: [],
  xp: 0,
  completed: false,
};

export function useDay1() {
  const [state, setState] = useStorage<Day1State>("d21.day1", DEFAULT_STATE);
  const { transactions } = useTransactions();
  const { toggleDay, isCompleted } = useJourney();

  // Transactions created during Day 1 (after start)
  const day1Txs = useMemo(() => {
    if (!state.startedAt) return [];
    return transactions.filter(
      (t) => !state.baselineTxIds.includes(t.id) && new Date(t.createdAt) >= new Date(state.startedAt!)
    );
  }, [transactions, state.startedAt, state.baselineTxIds]);

  const txCount = day1Txs.length;
  const hasCategorized = useMemo(
    () => day1Txs.some((t) => !!t.category && !!t.group),
    [day1Txs]
  );

  // Missions
  const missions = [
    { id: "tx1", label: "Criar 1 transação", done: txCount >= 1 },
    { id: "tx2", label: "Criar mais 1 transação", done: txCount >= 2 },
    { id: "cat", label: "Categorizar uma transação", done: hasCategorized },
  ];
  const doneCount = missions.filter((m) => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);
  const allDone = doneCount === missions.length;

  // Start Day 1: capture baseline txs
  const start = useCallback(() => {
    setState((prev) => {
      if (prev.startedAt) return prev;
      return {
        ...prev,
        startedAt: new Date().toISOString(),
        baselineTxIds: transactions.map((t) => t.id),
      };
    });
  }, [setState, transactions]);

  const saveSnapshot = useCallback(
    (hasToday: number, debt: number) => {
      setState((prev) => ({
        ...prev,
        snapshot: { hasToday, debt, savedAt: new Date().toISOString() },
        startedAt: prev.startedAt ?? new Date().toISOString(),
        baselineTxIds: prev.baselineTxIds.length ? prev.baselineTxIds : transactions.map((t) => t.id),
      }));
    },
    [setState, transactions]
  );

  // Dynamic cards triggered by milestones
  const triggers = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (txCount >= 1)
      list.push({ id: "after-tx1", text: "Você não precisa ganhar mais primeiro. Precisa controlar melhor." });
    if (txCount >= 2)
      list.push({ id: "after-tx2", text: "Controle não vem da teoria. Vem da repetição." });
    if (hasCategorized)
      list.push({ id: "after-cat", text: "Agora você não está só gastando. Está entendendo." });
    return list;
  }, [txCount, hasCategorized]);

  // Pending card (next one not yet shown)
  const pendingCard = triggers.find((t) => !state.shownCards.includes(t.id)) ?? null;

  const dismissCard = useCallback(
    (id: string) => {
      setState((prev) =>
        prev.shownCards.includes(id) ? prev : { ...prev, shownCards: [...prev.shownCards, id] }
      );
    },
    [setState]
  );

  const finish = useCallback(() => {
    setState((prev) => (prev.completed ? prev : { ...prev, completed: true, xp: prev.xp + 50 }));
    if (!isCompleted(1)) toggleDay(1);
  }, [setState, isCompleted, toggleDay]);

  const reset = useCallback(() => setState(DEFAULT_STATE), [setState]);

  return {
    state,
    snapshot: state.snapshot,
    missions,
    progress,
    doneCount,
    allDone,
    pendingCard,
    xp: state.xp,
    completed: state.completed,
    start,
    saveSnapshot,
    dismissCard,
    finish,
    reset,
  };
}
