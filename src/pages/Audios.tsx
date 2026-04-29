import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { INSPIRATION_LIBRARY, InspirationAudio, InspirationTrack } from "@/data/inspirationLibrary";
import { Headphones, Pause, Play, ChevronDown, ListMusic } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  collection: string;
};

function BonusAudioCard({
  item,
  playingId,
  currentId,
  onTrackPlay,
}: {
  item: InspirationAudio;
  playingId: string | null;
  currentId?: string;
  onTrackPlay: (item: InspirationAudio, track: InspirationTrack) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-elevated">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group block w-full text-left"
        aria-expanded={open}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={item.cover}
            alt={`Capa do audiobook ${item.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-card/95 via-card/35 to-transparent p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{item.folderLabel}</p>
              <h2 className="line-clamp-2 text-lg font-bold leading-tight text-card-foreground">{item.title}</h2>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", open && "rotate-180")} />
            </span>
          </div>
        </div>
      </button>

      <div className={cn("grid transition-all duration-500 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}> 
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-border/70 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">{item.author}</p>
              <p className="mt-2 text-sm leading-relaxed text-card-foreground">{item.description}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.hook}</p>
              <p className="mt-3 rounded-2xl bg-primary/10 p-3 text-sm font-semibold italic leading-snug text-primary">“{item.trigger}”</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-secondary/50 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <ListMusic className="h-3.5 w-3.5" /> Playlist
              </div>
              <div className="space-y-2">
                {item.tracks.map((track, index) => {
                  const selected = currentId === track.id;
                  const playing = playingId === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => onTrackPlay(item, track)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-smooth active:scale-[0.98]",
                        selected ? "bg-primary text-primary-foreground shadow-soft" : "bg-card hover:bg-card/80"
                      )}
                    >
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", selected ? "bg-primary-foreground/15" : "bg-primary/10 text-primary")}>
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{track.title}</span>
                        <span className={cn("block text-[10px]", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>Faixa {index + 1} • {track.duration}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
  speed,
  onSpeedChange,
  onToggle,
}: {
  track: PlayerTrack | null;
  playing: boolean;
  loading: boolean;
  progress: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onToggle: () => void;
}) {
  return (
    <section className="sticky top-3 z-30 mb-5 rounded-[1.35rem] border border-border/70 bg-card/95 p-4 shadow-floating backdrop-blur">
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
          {playing ? <Pause className="h-5 w-5" strokeWidth={3} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Player do bônus exclusivo</p>
          <h2 className="truncate text-sm font-bold leading-tight">{track ? track.title : "Selecione um audiobook"}</h2>
          <p className="truncate text-xs text-muted-foreground">{track ? `${track.collection} • ${track.subtitle}` : "As faixas aparecem dentro de cada capa."}</p>
        </div>
        <select
          aria-label="Velocidade do áudio"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="h-10 rounded-full border border-border bg-secondary px-2 text-xs font-bold text-secondary-foreground outline-none"
        >
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="w-8 text-right text-[10px] font-semibold text-muted-foreground">{Math.round(progress)}%</span>
      </div>
    </section>
  );
}

const Audios = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setLoading(true);
    audio.playbackRate = speed;
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

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

  const selectInspirationTrack = (item: InspirationAudio, track: InspirationTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      subtitle: item.author,
      src: track.src,
      collection: item.title,
    });
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;
    setPlayerProgress((audio.currentTime / audio.duration) * 100);
  };

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" /> Bônus Exclusivo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Best sellers com capa, cortina e playlist integrada.
        </p>
      </header>

      <AudioPlayer
        track={currentTrack}
        playing={!!playingId}
        loading={loading}
        progress={playerProgress}
        speed={speed}
        onSpeedChange={setSpeed}
        onToggle={() => currentTrack && playTrack(currentTrack)}
      />

      <section className="grid gap-4 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {INSPIRATION_LIBRARY.map((item) => (
          <BonusAudioCard
            key={item.id}
            item={item}
            playingId={playingId}
            currentId={currentTrack?.id}
            onTrackPlay={selectInspirationTrack}
          />
        ))}
      </section>

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setPlayingId(null);
          setPlayerProgress(100);
        }}
        onCanPlay={() => setLoading(false)}
        onPause={() => setPlayingId(null)}
        onPlay={() => currentTrack && setPlayingId(currentTrack.id)}
        onError={() => {
          setLoading(false);
          setPlayingId(null);
          toast.error("Este arquivo de áudio não pôde ser carregado.");
        }}
        onContextMenu={(event) => event.preventDefault()}
        className="hidden"
      />
    </MobileShell>
  );
};

export default Audios;
