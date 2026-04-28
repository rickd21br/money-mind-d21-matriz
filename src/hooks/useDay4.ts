import { useMemo, useCallback } from "react";
import { useStorage } from "./useStorage";
import { useJourney } from "./useFinance";

export type AssetType = "ativo" | "passivo";

export interface PatrimonyItem {
  id: string;
  name: string;       // ex.: "Aluguel recebido", "Financiamento do carro"
  type: AssetType;    // ativo (gera renda) ou passivo (gera custo)
  monthly: number;    // fluxo mensal: + para ativo, - para passivo (armazenamos sempre positivo)
}

export interface Day4State {
  items: PatrimonyItem[];
  /** Próximo ativo que o usuário se compromete a adquirir */
  nextAsset: string;
  acknowledged: {
    addedItem?: boolean;
    classifiedBoth?: boolean;     // possui ao menos 1 ativo e 1 passivo classificados
    nextAssetSet?: boolean;
    mindsetUnderstood?: boolean;  // leu/entendeu a regra de ouro
  };
  shownCards: string[];
  xp: number;
  completed: boolean;
}

const DEFAULT: Day4State = {
  items: [],
  nextAsset: "",
  acknowledged: {},
  shownCards: [],
  xp: 0,
  completed: false,
};

export function useDay4() {
  const [state, setState] = useStorage<Day4State>("d21.day4", DEFAULT);
  const { toggleDay, isCompleted } = useJourney();

  const totals = useMemo(() => {
    const ativos = state.items.filter(i => i.type === "ativo").reduce((a, i) => a + i.monthly, 0);
    const passivos = state.items.filter(i => i.type === "passivo").reduce((a, i) => a + i.monthly, 0);
    const fluxo = ativos - passivos;
    const hasAtivo = state.items.some(i => i.type === "ativo");
    const hasPassivo = state.items.some(i => i.type === "passivo");
    return { ativos, passivos, fluxo, hasAtivo, hasPassivo };
  }, [state.items]);

  const addItem = useCallback((it: Omit<PatrimonyItem, "id">) => {
    setState((p) => {
      const next = [...p.items, { ...it, id: crypto.randomUUID() }];
      const hasA = next.some(x => x.type === "ativo");
      const hasP = next.some(x => x.type === "passivo");
      return {
        ...p,
        items: next,
        acknowledged: {
          ...p.acknowledged,
          addedItem: true,
          classifiedBoth: hasA && hasP ? true : p.acknowledged.classifiedBoth,
        },
      };
    });
  }, [setState]);

  const removeItem = useCallback((id: string) => {
    setState((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  }, [setState]);

  const setNextAsset = useCallback((v: string) => {
    setState((p) => ({
      ...p,
      nextAsset: v,
      acknowledged: { ...p.acknowledged, nextAssetSet: v.trim().length > 2 },
    }));
  }, [setState]);

  const acknowledge = useCallback((key: keyof Day4State["acknowledged"]) => {
    setState((p) => ({ ...p, acknowledged: { ...p.acknowledged, [key]: true } }));
  }, [setState]);

  // Missões — Kiyosaki (Cap. 4): distinguir ativo de passivo + plano de aquisição
  const missions = useMemo(() => [
    { id: "item", label: "Cadastrar pelo menos 1 item patrimonial", done: !!state.acknowledged.addedItem },
    { id: "both", label: "Ter ao menos 1 ativo e 1 passivo classificados", done: !!state.acknowledged.classifiedBoth },
    { id: "next", label: "Definir o próximo ativo a adquirir", done: !!state.acknowledged.nextAssetSet },
    { id: "mind", label: "Entender a regra de ouro: ativo gera, passivo drena", done: !!state.acknowledged.mindsetUnderstood },
  ], [state]);

  const doneCount = missions.filter((m) => m.done).length;
  const progress = Math.round((doneCount / missions.length) * 100);
  const allDone = doneCount === missions.length;

  // Gatilhos emocionais — Kiyosaki
  const triggers = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (state.items.length > 0)
      list.push({
        id: "first-item",
        text: "Você acaba de enxergar seu patrimônio com olhos novos. A maioria nunca chega aqui.",
      });
    if (totals.hasAtivo && totals.hasPassivo)
      list.push({
        id: "both",
        text: "Quem distingue ativo de passivo pára de comprar passivos disfarçados de ativo.",
      });
    if (totals.fluxo < 0)
      list.push({
        id: "neg-flow",
        text: "Seu fluxo patrimonial está negativo. Não é fracasso — é diagnóstico. A virada começa hoje.",
      });
    if (totals.fluxo > 0)
      list.push({
        id: "pos-flow",
        text: "Fluxo positivo: seus ativos sustentam seus passivos. Esse é o caminho da liberdade.",
      });
    if (state.acknowledged.nextAssetSet)
      list.push({
        id: "next",
        text: `"${state.nextAsset}" deixou de ser desejo e virou meta. Riqueza é construída por decisões, não por sorte.`,
      });
    if (state.acknowledged.mindsetUnderstood)
      list.push({
        id: "mind",
        text: "Não trabalhe pelo dinheiro. Construa ativos que trabalhem por você enquanto dorme.",
      });
    return list;
  }, [state, totals]);

  const pendingCard = triggers.find((t) => !state.shownCards.includes(t.id)) ?? null;

  const dismissCard = useCallback((id: string) => {
    setState((p) => p.shownCards.includes(id) ? p : { ...p, shownCards: [...p.shownCards, id] });
  }, [setState]);

  const finish = useCallback(() => {
    setState((p) => p.completed ? p : { ...p, completed: true, xp: p.xp + 60 });
    if (!isCompleted(4)) toggleDay(4);
  }, [setState, isCompleted, toggleDay]);

  const reset = useCallback(() => setState(DEFAULT), [setState]);

  return {
    state,
    items: state.items,
    nextAsset: state.nextAsset,
    totals,
    missions,
    doneCount,
    progress,
    allDone,
    pendingCard,
    xp: state.xp,
    completed: state.completed,
    addItem,
    removeItem,
    setNextAsset,
    acknowledge,
    dismissCard,
    finish,
    reset,
  };
}
