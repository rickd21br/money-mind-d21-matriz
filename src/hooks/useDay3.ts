import { useMemo, useCallback } from "react";
import { useStorage } from "./useStorage";
import { useJourney } from "./useFinance";

export type IncomeSourceType = "ativa" | "passiva" | "automatica";

export interface IncomeSource {
  id: string;
  name: string;            // ex.: "Salário CLT", "Aluguel", "Dividendos"
  type: IncomeSourceType;  // ativa = trabalho, passiva = renda recorrente, automática = juros/dividendos
  monthly: number;         // valor mensal estimado
}

export interface Day3State {
  sources: IncomeSource[];
  /** % da renda mensal destinada a investimentos (0–100) */
  investPercent: number;
  acknowledged: {
    addedSource?: boolean;
    setPercent?: boolean;
    diversified?: boolean;     // tem ao menos 2 tipos diferentes
    pyramidUnderstood?: boolean;
  };
  shownCards: string[];
  xp: number;
  completed: boolean;
}

const DEFAULT: Day3State = {
  sources: [],
  investPercent: 0,
  acknowledged: {},
  shownCards: [],
  xp: 0,
  completed: false,
};

export function useDay3() {
  const [state, setState] = useStorage<Day3State>("d21.day3", DEFAULT);
  const { toggleDay, isCompleted } = useJourney();

  const totals = useMemo(() => {
    const ativa = state.sources.filter(s => s.type === "ativa").reduce((a, s) => a + s.monthly, 0);
    const passiva = state.sources.filter(s => s.type === "passiva").reduce((a, s) => a + s.monthly, 0);
    const automatica = state.sources.filter(s => s.type === "automatica").reduce((a, s) => a + s.monthly, 0);
    const total = ativa + passiva + automatica;
    const types = new Set(state.sources.map(s => s.type)).size;
    const monthlyInvest = (total * state.investPercent) / 100;
    // Projeção simples: 12 meses sem juros (didático)
    const yearInvest = monthlyInvest * 12;
    return { ativa, passiva, automatica, total, types, monthlyInvest, yearInvest };
  }, [state.sources, state.investPercent]);

  const addSource = useCallback((s: Omit<IncomeSource, "id">) => {
    setState((p) => {
      const next = [...p.sources, { ...s, id: crypto.randomUUID() }];
      const types = new Set(next.map(x => x.type)).size;
      return {
        ...p,
        sources: next,
        acknowledged: {
          ...p.acknowledged,
          addedSource: true,
          diversified: types >= 2 ? true : p.acknowledged.diversified,
        },
      };
    });
  }, [setState]);

  const removeSource = useCallback((id: string) => {
    setState((p) => ({ ...p, sources: p.sources.filter((s) => s.id !== id) }));
  }, [setState]);

  const setInvestPercent = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    setState((p) => ({
      ...p,
      investPercent: clamped,
      acknowledged: { ...p.acknowledged, setPercent: clamped > 0 },
    }));
  }, [setState]);

  const acknowledge = useCallback((key: keyof Day3State["acknowledged"]) => {
    setState((p) => ({ ...p, acknowledged: { ...p.acknowledged, [key]: true } }));
  }, [setState]);

  // Missões — Tiago Nigro (Cap. 3): mentalidade de investidor + diversificação
  const missions = useMemo(() => [
    { id: "src", label: "Mapear pelo menos 1 fonte de renda", done: !!state.acknowledged.addedSource },
    { id: "div", label: "Buscar diversificação (2+ tipos de renda)", done: !!state.acknowledged.diversified },
    { id: "pct", label: "Definir % da renda para investir", done: state.investPercent > 0 },
    { id: "pyr", label: "Entender a Pirâmide Financeira", done: !!state.acknowledged.pyramidUnderstood },
  ], [state]);

  const doneCount = missions.filter((m) => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);
  const allDone = doneCount === missions.length;

  // Gatilhos emocionais — frases inspiradas em Tiago Nigro / Primo Rico
  const triggers = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (state.sources.length > 0)
      list.push({
        id: "first-source",
        text: "Quem depende de uma única fonte de renda é refém dela. Você acabou de dar o primeiro passo para diversificar.",
      });
    if (totals.types >= 2)
      list.push({
        id: "diversified",
        text: "Diversificação é a única refeição grátis do mercado. Você já come dela.",
      });
    if (state.investPercent > 0 && state.investPercent < 10)
      list.push({
        id: "low-pct",
        text: `Investir ${state.investPercent}% já é melhor que 0%. Mas a meta do Primo Rico é 20–30% — mire alto.`,
      });
    if (state.investPercent >= 10 && state.investPercent < 20)
      list.push({
        id: "mid-pct",
        text: `${state.investPercent}% é um patamar de quem decidiu enriquecer. Constância vence intensidade.`,
      });
    if (state.investPercent >= 20)
      list.push({
        id: "high-pct",
        text: `${state.investPercent}% é mentalidade de investidor sério. "Não trabalhe pelo dinheiro: faça-o trabalhar por você."`,
      });
    if (state.acknowledged.pyramidUnderstood)
      list.push({
        id: "pyramid",
        text: "Reserva → Proteção → Crescimento. Pular degraus dá choque. Subir um por vez te leva ao topo.",
      });
    return list;
  }, [state, totals]);

  const pendingCard = triggers.find((t) => !state.shownCards.includes(t.id)) ?? null;

  const dismissCard = useCallback((id: string) => {
    setState((p) => p.shownCards.includes(id) ? p : { ...p, shownCards: [...p.shownCards, id] });
  }, [setState]);

  const finish = useCallback(() => {
    setState((p) => p.completed ? p : { ...p, completed: true, xp: p.xp + 60 });
    if (!isCompleted(3)) toggleDay(3);
  }, [setState, isCompleted, toggleDay]);

  const reset = useCallback(() => setState(DEFAULT), [setState]);

  return {
    state,
    sources: state.sources,
    investPercent: state.investPercent,
    totals,
    missions,
    doneCount,
    progress,
    allDone,
    pendingCard,
    xp: state.xp,
    completed: state.completed,
    addSource,
    removeSource,
    setInvestPercent,
    acknowledge,
    dismissCard,
    finish,
    reset,
  };
}
