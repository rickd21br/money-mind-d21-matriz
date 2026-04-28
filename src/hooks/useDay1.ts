import { useMemo, useCallback } from "react";
import { useStorage } from "./useStorage";
import { useTransactions, useJourney } from "./useFinance";

export type ESM = "E" | "S" | "M"; // Essencial, Supérfluo, Meta

export interface Day1Snapshot {
  hasToday: number;
  debt: number;
  monthlyIncome: number;
  savedAt: string;
}

export interface Day1State {
  snapshot: Day1Snapshot | null;
  startedAt: string | null;
  baselineTxIds: string[];
  shownCards: string[];
  // Pilar 2 (Cerbasi): classificação E/S/M por id de transação
  esm: Record<string, ESM>;
  // Pilar 3: alinhamento familiar (sim/só/—)
  familyAlignment: "alone" | "shared" | null;
  familyGoal: string;
  xp: number;
  completed: boolean;
}

const DEFAULT_STATE: Day1State = {
  snapshot: null,
  startedAt: null,
  baselineTxIds: [],
  shownCards: [],
  esm: {},
  familyAlignment: null,
  familyGoal: "",
  xp: 0,
  completed: false,
};

export function useDay1() {
  const [state, setState] = useStorage<Day1State>("d21.day1", DEFAULT_STATE);
  const { transactions } = useTransactions();
  const { toggleDay, isCompleted } = useJourney();

  // Conta todas as transações do usuário — qualquer lançamento conta para a missão.
  const incomeTxs = useMemo(() => transactions.filter((t) => t.type === "income"), [transactions]);
  const expenseTxs = useMemo(() => transactions.filter((t) => t.type === "expense"), [transactions]);
  const classifiedCount = expenseTxs.filter((t) => state.esm[t.id]).length;

  // Missões alinhadas aos 3 pilares de Cerbasi (Cap. 1)
  const missions = [
    { id: "snapshot", label: "Snapshot: quanto entra e quanto você tem (Pilar 1)", done: !!state.snapshot },
    { id: "income", label: "Registrar 1 entrada do mês (Pilar 1)", done: incomeTxs.length >= 1 },
    { id: "expenses", label: "Registrar 3 saídas (Pilar 1)", done: expenseTxs.length >= 3 },
    { id: "esm", label: "Classificar 3 gastos em E / S / M (Pilar 2)", done: classifiedCount >= 3 },
    { id: "family", label: "Alinhamento familiar + meta (Pilar 3)", done: !!state.familyAlignment && state.familyGoal.trim().length >= 3 },
  ];
  const doneCount = missions.filter((m) => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);
  const allDone = doneCount === missions.length;

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
    (hasToday: number, debt: number, monthlyIncome: number) => {
      setState((prev) => ({
        ...prev,
        snapshot: { hasToday, debt, monthlyIncome, savedAt: new Date().toISOString() },
        startedAt: prev.startedAt ?? new Date().toISOString(),
        baselineTxIds: prev.baselineTxIds.length ? prev.baselineTxIds : transactions.map((t) => t.id),
      }));
    },
    [setState, transactions]
  );

  const classifyTx = useCallback(
    (txId: string, label: ESM) => {
      setState((prev) => ({ ...prev, esm: { ...prev.esm, [txId]: label } }));
    },
    [setState]
  );

  const setFamily = useCallback(
    (alignment: "alone" | "shared", goal: string) => {
      setState((prev) => ({ ...prev, familyAlignment: alignment, familyGoal: goal }));
    },
    [setState]
  );

  // Cards dinâmicos com tom Cerbasi
  const triggers = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (state.snapshot)
      list.push({ id: "after-snapshot", text: "“Um orçamento não é uma prisão, é um mapa para suas escolhas.” — Cerbasi" });
    if (incomeTxs.length >= 1)
      list.push({ id: "after-income", text: "Saber quanto entra é o ponto de partida da inteligência financeira." });
    if (expenseTxs.length >= 3)
      list.push({ id: "after-expenses", text: "Você não pode controlar o que não enxerga. Continue anotando." });
    if (classifiedCount >= 3)
      list.push({ id: "after-esm", text: "E / S / M é o filtro: isso me aproxima da vida que quero ou só me distrai dela?" });
    if (state.familyAlignment)
      list.push({ id: "after-family", text: "“Família unida no planejamento é mais forte na realização.” — Cerbasi" });
    return list;
  }, [state.snapshot, state.familyAlignment, incomeTxs.length, expenseTxs.length, classifiedCount]);

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
    expenseTxs,
    incomeTxs,
    esm: state.esm,
    familyAlignment: state.familyAlignment,
    familyGoal: state.familyGoal,
    start,
    saveSnapshot,
    classifyTx,
    setFamily,
    dismissCard,
    finish,
    reset,
  };
}
