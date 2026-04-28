import { useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AUDIO_CHAPTERS, AudioChapter } from "@/data/audioChapters";
import { INSPIRATION_LIBRARY, InspirationAudio } from "@/data/inspirationLibrary";
import { useAudioProgress } from "@/hooks/useAudioProgress";
import { Headphones, Lightbulb, Target, Sparkles, Check, Lock, Brain, Gem, HeartHandshake, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
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

function ChapterCard({ chapter, locked }: { chapter: AudioChapter; locked: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { setProgress, isCompleted, getProgress } = useAudioProgress();
  const [open, setOpen] = useState(false);
  const completed = isCompleted(chapter.id);
  const pct = Math.round(getProgress(chapter.id) * 100);

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration || !isFinite(a.duration)) return;
    const ratio = a.currentTime / a.duration;
    setProgress(chapter.id, ratio);
    if (ratio >= 0.95 && !completed) {
      toast.success("Capítulo concluído!", { description: `+40 XP — ${chapter.title}` });
    }
  };

  return (
    <article
      className={cn(
        "rounded-3xl bg-card p-4 shadow-soft transition-smooth",
        locked && "opacity-50"
      )}
    >
      <header className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
            completed ? "gradient-primary text-primary-foreground shadow-glow" :
            locked ? "bg-muted text-muted-foreground" : "bg-secondary"
          )}
        >
          {completed ? <Check className="h-5 w-5" strokeWidth={3} /> : locked ? <Lock className="h-4 w-4" /> : chapter.number}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Capítulo {chapter.number} • {chapter.duration}
          </p>
          <h3 className="truncate text-sm font-bold leading-tight">{chapter.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{chapter.author}</p>
        </div>
      </header>

      {!locked && (
        <>
          <div className="mt-3">
            {chapter.src ? (
              <audio
                ref={audioRef}
                src={chapter.src}
                controls
                controlsList="nodownload noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                onTimeUpdate={onTime}
                onEnded={() => setProgress(chapter.id, 1)}
                className="w-full"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                Áudio em produção. Em breve disponível neste container.
              </div>
            )}
          </div>

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
                <p className="mt-1 text-sm italic leading-snug">"{chapter.triggers}"</p>
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
        </>
      )}
    </article>
  );
}

function InspirationCard({ item, index, active }: { item: InspirationAudio; index: number; active: boolean }) {
  const Icon = inspirationIcons[item.icon];

  return (
    <article
      className={cn(
        "relative flex min-h-[320px] min-w-[76%] snap-center flex-col justify-between overflow-hidden rounded-[1.4rem] border border-border/60 bg-card p-5 shadow-soft transition-smooth first:ml-0 -ml-8",
        active ? "z-20 scale-100 opacity-100 shadow-elevated" : "z-10 scale-[0.94] opacity-80"
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
          <p className="text-[11px] font-semibold text-muted-foreground">{item.duration}</p>
          <h3 className="mt-2 text-xl font-bold leading-[1.08] tracking-tight">{item.title}</h3>
          <p className="mt-1 text-sm font-semibold text-primary">{item.author}</p>
        </div>
      </header>

      <div className="relative mt-5 space-y-3">
        <p className="text-sm font-medium leading-snug">{item.description}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.hook}</p>

        {item.src ? (
          <audio
            src={item.src}
            controls
            controlsList="nodownload noplaybackrate"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-center text-[11px] font-medium text-muted-foreground">
            Player reservado para o áudio do acervo.
          </div>
        )}
      </div>
    </article>
  );
}

function LegacyInspirationCard({ item }: { item: InspirationAudio }) {
  const Icon = inspirationIcons[item.icon];

  return (
    <article className="min-w-[78%] rounded-3xl bg-card p-4 shadow-soft transition-smooth first:ml-0 -ml-5">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {item.format}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">{item.duration}</span>
          </div>
          <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{item.author}</p>
        </div>
      </header>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.description}</p>

      <div className="mt-3">
        {item.src ? (
          <audio
            src={item.src}
            controls
            controlsList="nodownload noplaybackrate"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
            Player reservado para o áudio do acervo.
          </div>
        )}
      </div>
    </article>
  );
}

const Audios = () => {
  const { state } = useAudioProgress();
  const inspirationScrollRef = useRef<HTMLDivElement>(null);
  const [activeInspiration, setActiveInspiration] = useState(0);

  const scrollInspiration = (direction: "left" | "right") => {
    const nextIndex = direction === "left"
      ? Math.max(activeInspiration - 1, 0)
      : Math.min(activeInspiration + 1, INSPIRATION_LIBRARY.length - 1);

    setActiveInspiration(nextIndex);
    inspirationScrollRef.current?.scrollBy({
      left: direction === "left" ? -238 : 238,
      behavior: "smooth",
    });
  };

  const handleInspirationScroll = () => {
    const el = inspirationScrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / INSPIRATION_LIBRARY.length;
    setActiveInspiration(Math.min(INSPIRATION_LIBRARY.length - 1, Math.round(el.scrollLeft / cardWidth)));
  };

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" /> Bônus Exclusivo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Biblioteca de Inspiração
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Referências em áudio para ampliar seus conhecimentos, entrar com conforto nesse universo literário e desenvolver novas ideias com os melhores autores do segmento — onde e quando puder.
        </p>
      </header>

      <section className="mb-5 rounded-3xl gradient-card p-5 text-primary-foreground shadow-elevated">
        <p className="text-xs font-medium opacity-90">Capítulos concluídos</p>
        <p className="mt-0.5 text-3xl font-bold">
          {state.completed.length}/{AUDIO_CHAPTERS.length}
        </p>
        <p className="mt-1 text-[11px] opacity-90">+{state.xp} XP acumulados</p>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">Acervo de best sellers</h2>
            <p className="text-xs text-muted-foreground">Toque, arraste ou use as setas para explorar</p>
          </div>
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
          className="flex snap-x snap-mandatory overflow-x-auto px-8 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {INSPIRATION_LIBRARY.map((item, index) => (
            <InspirationCard key={item.id} item={item} index={index} active={index === activeInspiration} />
          ))}
        </div>
      </section>

      <div className="space-y-3">
        {AUDIO_CHAPTERS.map((c, idx) => {
          const prevDone = idx === 0 || state.completed.includes(AUDIO_CHAPTERS[idx - 1].id);
          return <ChapterCard key={c.id} chapter={c} locked={!prevDone} />;
        })}
      </div>
    </MobileShell>
  );
};

export default Audios;
