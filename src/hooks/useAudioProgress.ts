import { useStorage } from "./useStorage";

export interface AudioState {
  /** progresso 0..1 */
  progress: Record<string, number>;
  /** capítulos concluídos (ouvidos >= 95%) */
  completed: string[];
  /** XP acumulado pelos áudios */
  xp: number;
}

const INITIAL: AudioState = { progress: {}, completed: [], xp: 0 };

export function useAudioProgress() {
  const [state, setState] = useStorage<AudioState>("d21.audioProgress", INITIAL);

  const setProgress = (id: string, value: number) => {
    setState((s) => {
      const next = { ...s, progress: { ...s.progress, [id]: value } };
      if (value >= 0.95 && !s.completed.includes(id)) {
        next.completed = [...s.completed, id];
        next.xp = s.xp + 40;
      }
      return next;
    });
  };

  const isCompleted = (id: string) => state.completed.includes(id);
  const getProgress = (id: string) => state.progress[id] ?? 0;

  return { state, setProgress, isCompleted, getProgress };
}
