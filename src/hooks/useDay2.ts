import { useMemo, useCallback } from "react";
import { useStorage } from "./useStorage";
import { useJourney } from "./useFinance";

export interface Debt {
  id: string;
  name: string;          // ex.: "Cartão Nubank"
  balance: number;       // saldo devedor
  rate?: number;         // % juros mensal (opcional, didático)
  minPayment: number;    // pagamento mínimo
}

export interface Day2State {
  debts: Debt[];
  // Quanto o usuário consegue separar por mês para "atacar" a menor dívida
  snowballAmount: number;
  // Reflexões/missões marcadas
  acknowledged: {
    addedDebts?: boolean;       // listou pelo menos 1 dívida (ou marcou "estou sem dívidas")
    sortedSnowball?: boolean;   // viu a ordem da bola de neve
    cutOneSuperfluo?: boolean;  // comprometeu-se a cortar 1 supérfluo
    setSnowball?: boolean;      // definiu o valor extra mensal
  };
  shownCards: string[];
  noDebts: boolean;             // declarou não ter dívidas
  xp: number;
  completed: boolean;
}

const DEFAULT: Day2State = {
  debts: [],
  snowballAmount: 0,
  acknowledged: {},
  shownCards: [],
  noDebts: false,
  xp: 0,
  completed: false,
};

export function useDay2() {
  const [state, setState] = useStorage<Day2State>("d21.day2", DEFAULT);
  const { toggleDay, isCompleted } = useJourney();

  /** Bola de Neve: ordena dívidas do MENOR para o MAIOR saldo (método Ramsey). */
  const snowballOrder = useMemo(
    () => [...state.debts].sort((a, b) => a.balance - b.balance),
    [state.debts]
  );

  const totals = useMemo(() => {
    const total = state.debts.reduce((s, d) => s + d.balance, 0);
    const minSum = state.debts.reduce((s, d) => s + d.minPayment, 0);
    const target = snowballOrder[0];
    const attackOnTarget = target ? target.minPayment + state.snowballAmount : 0;
    return { total, minSum, target, attackOnTarget };
  }, [state.debts, state.snowballAmount, snowballOrder]);

  /** Estimativa simplificada de meses para quitar a 1ª dívida (sem juros). */
  const monthsToKillFirst = useMemo(() => {
    if (!totals.target) return 0;
    const pay = totals.attackOnTarget;
    if (pay <= 0) return 0;
    return Math.ceil(totals.target.balance / pay);
  }, [totals]);

  const addDebt = useCallback((d: Omit<Debt, "id">) => {
    setState((p) => ({
      ...p,
      debts: [...p.debts, { ...d, id: crypto.randomUUID() }],
      noDebts: false,
      acknowledged: { ...p.acknowledged, addedDebts: true },
    }));
  }, [setState]);

  const removeDebt = useCallback((id: string) => {
    setState((p) => ({ ...p, debts: p.debts.filter((d) => d.id !== id) }));
  }, [setState]);

  const updateDebt = useCallback((id: string, patch: Partial<Omit<Debt, "id">>) => {
    setState((p) => ({ ...p, debts: p.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  }, [setState]);

  const declareNoDebts = useCallback(() => {
    setState((p) => ({
      ...p,
      noDebts: true,
      acknowledged: { ...p.acknowledged, addedDebts: true, sortedSnowball: true },
    }));
  }, [setState]);

  const setSnowballAmount = useCallback((v: number) => {
    setState((p) => ({
      ...p,
      snowballAmount: Math.max(0, v),
      acknowledged: { ...p.acknowledged, setSnowball: v > 0 },
    }));
  }, [setState]);

  const acknowledge = useCallback((key: keyof Day2State["acknowledged"]) => {
    setState((p) => ({ ...p, acknowledged: { ...p.acknowledged, [key]: true } }));
  }, [setState]);

  // Missões alinhadas a Dave Ramsey (Cap. 2 do sumário)
  const missions = useMemo(() => [
    {
      id: "list",
      label: "Listar todas as dívidas (ou declarar zero)",
      done: !!state.acknowledged.addedDebts || state.noDebts,
    },
    {
      id: "order",
      label: "Ver a ordem da Bola de Neve (menor → maior)",
      done: !!state.acknowledged.sortedSnowball || state.noDebts,
    },
    {
      id: "snowball",
      label: "Definir o valor extra mensal de ataque",
      done: state.snowballAmount > 0 || state.noDebts,
    },
    {
      id: "cut",
      label: "Comprometer-se a cortar 1 supérfluo para acelerar",
      done: !!state.acknowledged.cutOneSuperfluo,
    },
  ], [state]);

  const doneCount = missions.filter((m) => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);
  const allDone = doneCount === missions.length;

  // Cards dinâmicos — gatilhos emocionais Ramsey
  const triggers = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (state.debts.length > 0)
      list.push({
        id: "after-list",
        text: "“Você não pode mudar o que finge não enxergar.” Listar é o primeiro ato de coragem.",
      });
    if (state.acknowledged.sortedSnowball && snowballOrder[0])
      list.push({
        id: "after-order",
        text: `Comece pela menor: ${snowballOrder[0].name}. Vitórias rápidas alimentam a constância.`,
      });
    if (state.snowballAmount > 0 && totals.target)
      list.push({
        id: "after-snowball",
        text: `Com esse ataque, você quita "${totals.target.name}" em ~${monthsToKillFirst} meses. Cada mês é uma vitória.`,
      });
    if (state.acknowledged.cutOneSuperfluo)
      list.push({
        id: "after-cut",
        text: "“Viva como ninguém quer hoje, para viver como ninguém pode amanhã.” — Dave Ramsey",
      });
    if (state.noDebts)
      list.push({
        id: "no-debts",
        text: "Sem dívidas é uma posição rara — e poderosa. Agora a bola de neve trabalha A SEU FAVOR: vire-a para investimentos.",
      });
    return list;
  }, [state, snowballOrder, totals, monthsToKillFirst]);

  const pendingCard = triggers.find((t) => !state.shownCards.includes(t.id)) ?? null;

  const dismissCard = useCallback((id: string) => {
    setState((p) => p.shownCards.includes(id) ? p : { ...p, shownCards: [...p.shownCards, id] });
  }, [setState]);

  const finish = useCallback(() => {
    setState((p) => p.completed ? p : { ...p, completed: true, xp: p.xp + 60 });
    if (!isCompleted(2)) toggleDay(2);
  }, [setState, isCompleted, toggleDay]);

  const reset = useCallback(() => setState(DEFAULT), [setState]);

  return {
    state,
    debts: state.debts,
    snowballOrder,
    totals,
    monthsToKillFirst,
    snowballAmount: state.snowballAmount,
    noDebts: state.noDebts,
    missions,
    doneCount,
    progress,
    allDone,
    pendingCard,
    xp: state.xp,
    completed: state.completed,
    addDebt,
    updateDebt,
    removeDebt,
    declareNoDebts,
    setSnowballAmount,
    acknowledge,
    dismissCard,
    finish,
    reset,
  };
}
