import { useStorage } from "./useStorage";

export interface IceBreakerState {
  /** progresso 0..1 por id */
  progress: Record<string, number>;
  /** ids concluídos (>=95%) */
  completed: string[];
  /** XP acumulado nos quebra-gelo */
  xp: number;
}

const INITIAL: IceBreakerState = { progress: {}, completed: [], xp: 0 };

export function useIceBreakerProgress() {
  const [state, setState] = useStorage<IceBreakerState>("d21.iceBreaker", INITIAL);

  const setProgress = (id: string, value: number) => {
    setState((s) => {
      const next = { ...s, progress: { ...s.progress, [id]: value } };
      if (value >= 0.95 && !s.completed.includes(id)) {
        next.completed = [...s.completed, id];
        next.xp = s.xp + 15;
      }
      return next;
    });
  };

  const isCompleted = (id: string) => state.completed.includes(id);
  const getProgress = (id: string) => state.progress[id] ?? 0;

  return { state, setProgress, isCompleted, getProgress };
}
