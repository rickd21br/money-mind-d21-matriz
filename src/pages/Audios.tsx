import { useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AUDIO_CHAPTERS, AudioChapter } from "@/data/audioChapters";
import { INSPIRATION_LIBRARY, InspirationAudio } from "@/data/inspirationLibrary";
import { useAudioProgress } from "@/hooks/useAudioProgress";
import { Headphones, Lightbulb, Target, Sparkles, Check, Lock, BookOpen, Brain, Gem, HeartHandshake, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const inspirationIcons = {
  mind: Brain,
  wealth: Gem,
  habit: Leaf,
  couple: HeartHandshake,
};

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

function InspirationCard({ item }: { item: InspirationAudio }) {
  const Icon = inspirationIcons[item.icon];

  return (
    <article className="rounded-3xl bg-card p-4 shadow-soft transition-smooth">
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

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" /> Áudios do Ebook
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ouça os capítulos, conquiste XP e fortaleça sua jornada.
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
        <div className="mb-3 rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-wider">Bônus Exclusivo</p>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight">Biblioteca de Inspiração</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Uma trilha de referências para ampliar seu conhecimento e entrar com conforto no universo literário da prosperidade. A equipe reuniu best sellers em áudio para você ouvir onde e quando puder, absorvendo ideias dos autores mais conceituados do segmento.
          </p>
        </div>

        <div className="space-y-3">
          {INSPIRATION_LIBRARY.map((item) => (
            <InspirationCard key={item.id} item={item} />
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
