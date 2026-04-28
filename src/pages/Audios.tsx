import { useEffect, useMemo, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AUDIO_CHAPTERS, AudioChapter } from "@/data/audioChapters";
import { INSPIRATION_LIBRARY, InspirationAudio, InspirationTrack } from "@/data/inspirationLibrary";
import { useAudioProgress } from "@/hooks/useAudioProgress";
import { Headphones, Lightbulb, Target, Sparkles, Check, Brain, Gem, HeartHandshake, Leaf, ChevronLeft, ChevronRight, Play, Pause, Volume2, ListMusic, BookOpen, FolderOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inspirationIcons = {
  mind: Brain,
  wealth: Gem,
  habit: Leaf,
  couple: HeartHandshake,
};

const inspirationPalette = ["bg-primary", "bg-accent", "bg-secondary", "bg-muted"];

type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  collection: string;
};

function ChapterCard({
  chapter,
  selected,
  playing,
  onPlay,
}: {
  chapter: AudioChapter;
  selected: boolean;
  playing: boolean;
  onPlay: () => void;
}) {
  const { setProgress, isCompleted, getProgress } = useAudioProgress();
  const [open, setOpen] = useState(false);
  const completed = isCompleted(chapter.id);
  const pct = Math.round(getProgress(chapter.id) * 100);

  return (
    <article
      className={cn(
        "rounded-[1.35rem] border bg-card p-4 shadow-soft transition-smooth",
        selected ? "border-primary shadow-elevated" : "border-border/70"
      )}
    >
      <header className="flex items-start gap-3">
        <button
          type="button"
          onClick={onPlay}
          aria-label={`${playing ? "Pausar" : "Tocar"} ${chapter.title}`}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-smooth active:scale-95",
            completed || playing ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
          )}
        >
          {playing ? <Pause className="h-5 w-5" strokeWidth={3} /> : completed ? <Check className="h-5 w-5" strokeWidth={3} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Capítulo {chapter.number} • {chapter.duration}
          </p>
          <h3 className="line-clamp-2 text-sm font-bold leading-tight">{chapter.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{chapter.author}</p>
        </div>
      </header>

      <div className="mt-3 flex items-center gap-2">
        <Progress value={pct} className="h-1.5 flex-1" />
        <span className="text-[10px] font-semibold text-muted-foreground">{pct}%</span>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 w-full rounded-xl bg-secondary py-2 text-xs font-semibold transition-smooth hover:bg-secondary/80"
      >
        {open ? "Ocultar" : "Ver"} insights e desafios
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Gatilho
            </div>
            <p className="mt-1 text-sm italic leading-snug">“{chapter.triggers}”</p>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" /> Insights
            </div>
            <ul className="mt-1.5 space-y-1">
              {chapter.insights.map((i, idx) => (
                <li key={idx} className="text-xs leading-snug">• {i}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> Desafios
            </div>
            <ul className="mt-1.5 space-y-1">
              {chapter.challenges.map((c, idx) => (
                <li key={idx} className="text-xs leading-snug">• {c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}

function InspirationCard({
  item,
  index,
  active,
  playingId,
  onTrackPlay,
}: {
  item: InspirationAudio;
  index: number;
  active: boolean;
  playingId: string | null;
  onTrackPlay: (item: InspirationAudio, track: InspirationTrack) => void;
}) {
  const Icon = inspirationIcons[item.icon];

  return (
    <article
      data-inspiration-card
      className={cn(
        "relative flex min-h-[386px] min-w-[78%] snap-center flex-col justify-between overflow-hidden rounded-[1.2rem] border bg-card p-4 shadow-soft transition-all duration-300 first:ml-0 -ml-12",
        active
          ? "z-40 translate-y-0 rotate-0 scale-100 border-primary shadow-floating opacity-100"
          : "z-10 translate-y-5 rotate-[-2deg] scale-[0.9] border-border/70 opacity-75"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

      <header className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-soft", inspirationPalette[index % inspirationPalette.length])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="rounded-full bg-secondary/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            {item.format}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-muted-foreground">{item.folderLabel}</p>
          <h3 className="mt-2 text-xl font-bold leading-[1.08]">{item.title}</h3>
          <p className="mt-1 text-sm font-semibold text-primary">{item.author}</p>
        </div>
      </header>

      <div className="relative mt-5 space-y-3">
        <p className="text-sm font-medium leading-snug">{item.description}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.hook}</p>

        <div className="rounded-2xl border border-border/70 bg-secondary/40 p-2">
          <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5" /> Lista de áudios
          </div>
          <div className="space-y-1.5">
            {item.tracks.map((track) => {
              const playing = playingId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onTrackPlay(item, track)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-smooth active:scale-[0.98]",
                    playing ? "bg-primary text-primary-foreground shadow-soft" : "bg-card/80 hover:bg-card"
                  )}
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", playing ? "bg-primary-foreground/15" : "bg-primary/10 text-primary")}>
                    {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{track.title}</span>
                    <span className={cn("block text-[10px]", playing ? "text-primary-foreground/80" : "text-muted-foreground")}>{track.duration}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function AudioPlayer({
  track,
  playing,
  loading,
  progress,
  onToggle,
}: {
  track: PlayerTrack | null;
  playing: boolean;
  loading: boolean;
  progress: number;
  onToggle: () => void;
}) {
  return (
    <section className="mb-5 rounded-[1.4rem] border border-border/70 bg-card p-4 shadow-elevated">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!track || loading}
          aria-label={playing ? "Pausar áudio atual" : "Tocar áudio atual"}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-smooth active:scale-95 disabled:opacity-50",
            track ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"
          )}
        >
          {loading ? <Volume2 className="h-5 w-5 animate-pulse" /> : playing ? <Pause className="h-5 w-5" strokeWidth={3} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Player do audiobook</p>
          <h2 className="truncate text-sm font-bold leading-tight">{track ? track.title : "Selecione um áudio para começar"}</h2>
          <p className="truncate text-xs text-muted-foreground">{track ? `${track.collection} • ${track.subtitle}` : "Capítulos e faixas do acervo aparecem na lista abaixo."}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="w-8 text-right text-[10px] font-semibold text-muted-foreground">{Math.round(progress)}%</span>
      </div>
    </section>
  );
}

const Audios = () => {
  const { state, setProgress } = useAudioProgress();
  const inspirationScrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeInspiration, setActiveInspiration] = useState(0);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);

  const chapterTrackIds = useMemo(() => new Set(AUDIO_CHAPTERS.map((chapter) => chapter.id)), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setLoading(true);
    audio.load();
    audio.play()
      .then(() => {
        setLoading(false);
        setPlayingId(currentTrack.id);
      })
      .catch(() => {
        setLoading(false);
        setPlayingId(null);
        toast.error("Não consegui iniciar este áudio.");
      });
  }, [currentTrack]);

  const playTrack = (track: PlayerTrack) => {
    const audio = audioRef.current;
    if (currentTrack?.id === track.id && audio) {
      if (audio.paused) {
        audio.play()
          .then(() => setPlayingId(track.id))
          .catch(() => toast.error("Não consegui retomar este áudio."));
      } else {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }

    setPlayerProgress(0);
    setCurrentTrack(track);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !audio.duration || !isFinite(audio.duration)) return;

    const pct = (audio.currentTime / audio.duration) * 100;
    setPlayerProgress(pct);

    if (chapterTrackIds.has(currentTrack.id)) {
      setProgress(currentTrack.id, pct / 100);
    }
  };

  const handleEnded = () => {
    if (currentTrack && chapterTrackIds.has(currentTrack.id)) {
      setProgress(currentTrack.id, 1);
    }
    setPlayingId(null);
    setPlayerProgress(100);
  };

  const selectChapter = (chapter: AudioChapter) => {
    playTrack({
      id: chapter.id,
      title: chapter.title,
      subtitle: chapter.author,
      src: chapter.src,
      collection: "Ebook Oficial",
    });
  };

  const selectInspirationTrack = (item: InspirationAudio, track: InspirationTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      subtitle: item.author,
      src: track.src,
      collection: item.title,
    });
  };

  const scrollInspiration = (direction: "left" | "right") => {
    const nextIndex = direction === "left"
      ? Math.max(activeInspiration - 1, 0)
      : Math.min(activeInspiration + 1, INSPIRATION_LIBRARY.length - 1);

    setActiveInspiration(nextIndex);
    const child = inspirationScrollRef.current?.querySelectorAll<HTMLElement>("[data-inspiration-card]")[nextIndex];
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handleInspirationScroll = () => {
    const el = inspirationScrollRef.current;
    if (!el) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-inspiration-card]"));
    const closest = cards.reduce((best, card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });

    setActiveInspiration(closest.index);
  };

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" /> Áudios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bônus, audiobooks e capítulos oficiais em um só player.
        </p>
      </header>

      <AudioPlayer
        track={currentTrack}
        playing={!!playingId}
        loading={loading}
        progress={playerProgress}
        onToggle={() => currentTrack && playTrack(currentTrack)}
      />

      <section className="mb-5 rounded-3xl gradient-card p-5 text-primary-foreground shadow-elevated">
        <p className="text-xs font-medium opacity-90">Capítulos concluídos</p>
        <p className="mt-0.5 text-3xl font-bold">
          {state.completed.length}/{AUDIO_CHAPTERS.length}
        </p>
        <p className="mt-1 text-[11px] opacity-90">+{state.xp} XP acumulados</p>
      </section>

      <section className="mb-6 overflow-visible rounded-[1.35rem] border border-border/70 bg-card shadow-elevated">
        <button
          type="button"
          onClick={() => setInspirationOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
          aria-expanded={inspirationOpen}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ListMusic className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold tracking-tight">Acervo de best sellers</span>
              <span className="block text-xs text-muted-foreground">Container suspenso com faixas por pasta</span>
            </span>
          </span>
          <ChevronRight className={cn("h-5 w-5 shrink-0 text-primary transition-transform", inspirationOpen && "rotate-90")} />
        </button>

        <div className={cn("grid transition-all duration-500 ease-out", inspirationOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="border-t border-border/70 px-4 pb-5 pt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">Arraste, toque ou use os controles</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Voltar referências"
                    onClick={() => scrollInspiration("left")}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/90 text-primary shadow-soft transition-smooth hover:bg-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Avançar referências"
                    onClick={() => scrollInspiration("right")}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/90 text-primary shadow-soft transition-smooth hover:bg-secondary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                ref={inspirationScrollRef}
                onScroll={handleInspirationScroll}
                className="flex snap-x snap-mandatory overflow-x-auto overflow-y-visible px-9 pb-3 pt-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {INSPIRATION_LIBRARY.map((item, index) => (
                  <InspirationCard
                    key={item.id}
                    item={item}
                    index={index}
                    active={index === activeInspiration}
                    playingId={playingId}
                    onTrackPlay={selectInspirationTrack}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-base font-bold tracking-tight">Capítulos do Ebook Oficial</h2>
            <p className="text-xs text-muted-foreground">Lista liberada com player integrado</p>
          </div>
        </div>

        <div className="space-y-3">
          {AUDIO_CHAPTERS.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              selected={currentTrack?.id === chapter.id}
              playing={playingId === chapter.id}
              onPlay={() => selectChapter(chapter)}
            />
          ))}
        </div>
      </section>

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onCanPlay={() => setLoading(false)}
        onPause={() => setPlayingId(null)}
        onPlay={() => currentTrack && setPlayingId(currentTrack.id)}
        onError={() => {
          setLoading(false);
          setPlayingId(null);
          toast.error("Este arquivo de áudio não pôde ser carregado.");
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="hidden"
      />
    </MobileShell>
  );
};

export default Audios;
