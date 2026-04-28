import { useEffect, useMemo, useRef, useState } from "react";
import { ICE_BREAKER_AUDIOS, IceBreakerAudio } from "@/data/iceBreakerAudios";
import { useIceBreakerProgress } from "@/hooks/useIceBreakerProgress";
import { Sparkles, Play, Pause, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Container "Comece aqui — Quebra-Gelo".
 * Hero card neon pulsante com o Mentor do Progresso conduzindo o usuário
 * pelos 10 áudios de boas-vindas.
 */
export function IceBreakerHero() {
  const { state, setProgress, isCompleted, getProgress } = useIceBreakerProgress();
  const [index, setIndex] = useState<number>(() => {
    // Abre no primeiro não-concluído
    const firstPending = ICE_BREAKER_AUDIOS.findIndex((a) => !state.completed.includes(a.id));
    return firstPending === -1 ? 0 : firstPending;
  });
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = ICE_BREAKER_AUDIOS[index];
  const total = ICE_BREAKER_AUDIOS.length;
  const completedCount = state.completed.length;
  const allDone = completedCount === total;
  const pct = Math.round(getProgress(current.id) * 100);

  // Pausa ao trocar de áudio
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.load();
    setPlaying(false);
  }, [index]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) {
        await a.play();
        setPlaying(true);
      } else {
        a.pause();
        setPlaying(false);
      }
    } catch {
      toast.error("Não consegui iniciar o áudio.");
    }
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration || !isFinite(a.duration)) return;
    const ratio = a.currentTime / a.duration;
    const wasDone = isCompleted(current.id);
    setProgress(current.id, ratio);
    if (ratio >= 0.95 && !wasDone) {
      toast.success("Bloco concluído!", { description: `+15 XP — ${current.title}` });
    }
  };

  const onEnded = () => {
    setProgress(current.id, 1);
    setPlaying(false);
    // Auto-avança para o próximo não-concluído
    const next = ICE_BREAKER_AUDIOS.findIndex(
      (a, i) => i > index && !state.completed.includes(a.id),
    );
    if (next !== -1) setTimeout(() => setIndex(next), 600);
  };

  const go = (delta: number) => {
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-[hsl(165_40%_8%)] text-[hsl(150_20%_96%)]",
        "ring-1 ring-[hsl(var(--primary-glow)/0.55)]",
        !allDone && "animate-neon-pulse",
      )}
      aria-label="Comece aqui — Áudios Quebra-Gelo do Mentor do Progresso"
    >
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[hsl(var(--primary-glow)/0.35)] blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-[hsl(162_73%_38%/0.35)] blur-3xl" />
        {/* Grid tech sutil */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary-glow))] shadow-[0_0_10px_hsl(var(--primary-glow))]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary-glow))]">
                Mentor do Progresso · Online
              </span>
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-2xl font-extrabold leading-none tracking-tight">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary-glow))]" />
              Comece aqui
            </h2>
            <p className="mt-1 text-xs font-medium text-[hsl(150_20%_75%)]">
              Quebra-Gelo · {completedCount}/{total} blocos
            </p>
          </div>

          {/* Orb do Mentor (visual tecnológico) */}
          <MentorOrb playing={playing} />
        </div>

        {/* Título do bloco atual */}
        <div className="mt-4 rounded-2xl border border-[hsl(var(--primary-glow)/0.25)] bg-[hsl(165_30%_6%/0.6)] p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary-glow))]">
              Bloco {current.number} · {current.duration}
            </p>
            {isCompleted(current.id) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary-glow)/0.18)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-glow))]">
                <Check className="h-3 w-3" strokeWidth={3} /> Concluído
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-bold leading-tight">{current.title}</h3>
          <p className="mt-1 text-xs leading-snug text-[hsl(150_20%_78%)]">{current.subtitle}</p>
        </div>

        {/* Soundwave + Player */}
        <div className="mt-4 rounded-2xl border border-[hsl(var(--primary-glow)/0.2)] bg-[hsl(165_30%_5%/0.7)] p-3">
          <SoundWave active={playing} />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Bloco anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pausar" : "Tocar"}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                "bg-[hsl(var(--primary-glow))] text-[hsl(165_40%_8%)]",
                "shadow-[0_0_24px_hsl(var(--primary-glow)/0.7)] transition active:scale-95",
              )}
            >
              {playing ? <Pause className="h-5 w-5" strokeWidth={3} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={3} />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[hsl(var(--primary-glow))] shadow-[0_0_10px_hsl(var(--primary-glow))] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-medium text-white/60">{pct}% ouvido</p>
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === total - 1}
              aria-label="Próximo bloco"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Audio HTML invisível */}
          <audio
            ref={audioRef}
            src={current.src}
            preload="metadata"
            onTimeUpdate={onTime}
            onEnded={onEnded}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onContextMenu={(e) => e.preventDefault()}
            className="hidden"
          />
        </div>

        {/* Stepper de blocos */}
        <div className="mt-4 grid grid-cols-10 gap-1">
          {ICE_BREAKER_AUDIOS.map((a, i) => {
            const done = isCompleted(a.id);
            const active = i === index;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir para bloco ${a.number}: ${a.title}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  done
                    ? "bg-[hsl(var(--primary-glow))] shadow-[0_0_8px_hsl(var(--primary-glow))]"
                    : active
                      ? "bg-white/70"
                      : "bg-white/15",
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Sub-componentes visuais ---------- */

function MentorOrb({ playing }: { playing: boolean }) {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-[hsl(var(--primary-glow)/0.25)] blur-md",
          playing ? "animate-mentor-orb" : "animate-pulse",
        )}
      />
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[hsl(var(--primary-glow))] to-[hsl(162_73%_38%)]",
          "shadow-[0_0_20px_hsl(var(--primary-glow)/0.7)]",
        )}
      >
        {/* Anéis tech */}
        <span className="absolute inset-0 rounded-full ring-1 ring-white/30" />
        <span className="absolute inset-1 rounded-full ring-1 ring-white/15" />
        <span className="text-[10px] font-black tracking-tighter text-[hsl(165_40%_8%)]">MP</span>
      </div>
    </div>
  );
}

function SoundWave({ active }: { active: boolean }) {
  // 32 barras com alturas-base variando para look orgânico
  const bars = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => {
        // padrão senoidal pseudo-aleatório
        const h = 30 + Math.round(Math.abs(Math.sin(i * 0.7)) * 70);
        const delay = (i % 8) * 0.08;
        return { h, delay };
      }),
    [],
  );

  return (
    <div className="flex h-14 items-center justify-between gap-[3px] px-1" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-center rounded-full bg-gradient-to-t from-[hsl(162_73%_38%)] to-[hsl(var(--primary-glow))]",
            active && "shadow-[0_0_6px_hsl(var(--primary-glow))]",
          )}
          style={{
            height: `${b.h}%`,
            animation: active
              ? `wave-bar 0.9s ease-in-out ${b.delay}s infinite`
              : undefined,
            opacity: active ? 1 : 0.35,
            transform: active ? undefined : "scaleY(0.4)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
        />
      ))}
      {/* keyframes inline para wave-bar (Tailwind config também possui) */}
      <style>{`@keyframes wave-bar { 0%,100%{transform:scaleY(0.25)} 50%{transform:scaleY(1)} }`}</style>
    </div>
  );
}
