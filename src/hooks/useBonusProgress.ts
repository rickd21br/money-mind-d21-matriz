import { useStorage } from "./useStorage";

export interface BonusState {
  /** progresso por trackId em segundos */
  position: Record<string, number>;
  /** duração conhecida por trackId */
  duration: Record<string, number>;
  /** trackIds concluídos (>=95%) */
  completedTracks: string[];
  /** audiobooks concluídos (todas as faixas) */
  completedBooks: string[];
  /** avaliação 1..5 por audiobookId */
  ratings: Record<string, number>;
}

const INITIAL: BonusState = {
  position: {},
  duration: {},
  completedTracks: [],
  completedBooks: [],
  ratings: {},
};

export function useBonusProgress() {
  const [state, setState] = useStorage<BonusState>("d21.bonusProgress", INITIAL);

  const savePosition = (trackId: string, time: number, duration: number) =>
    setState((s) => ({
      ...s,
      position: { ...s.position, [trackId]: time },
      duration: duration ? { ...s.duration, [trackId]: duration } : s.duration,
    }));

  const getPosition = (trackId: string) => state.position[trackId] ?? 0;

  const markTrackCompleted = (trackId: string, bookId: string, allTrackIds: string[]) => {
    let bookJustCompleted = false;
    setState((s) => {
      const completedTracks = s.completedTracks.includes(trackId)
        ? s.completedTracks
        : [...s.completedTracks, trackId];
      const allDone = allTrackIds.every((id) => completedTracks.includes(id));
      const alreadyBook = s.completedBooks.includes(bookId);
      const completedBooks = allDone && !alreadyBook ? [...s.completedBooks, bookId] : s.completedBooks;
      bookJustCompleted = allDone && !alreadyBook;
      return { ...s, completedTracks, completedBooks };
    });
    return bookJustCompleted;
  };

  const setRating = (bookId: string, value: number) =>
    setState((s) => ({ ...s, ratings: { ...s.ratings, [bookId]: value } }));

  const isBookCompleted = (bookId: string) => state.completedBooks.includes(bookId);
  const getRating = (bookId: string) => state.ratings[bookId] ?? 0;

  return { state, savePosition, getPosition, markTrackCompleted, setRating, isBookCompleted, getRating };
}
