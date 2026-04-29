import { useEffect, useMemo, useRef, useState } from "react";
import { ICE_BREAKER_AUDIOS } from "@/data/iceBreakerAudios";
import { useIceBreakerProgress } from "@/hooks/useIceBreakerProgress";
import { Sparkles, Play, Pause, Check, ChevronLeft, ChevronRight, Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MENTOR_IMG = "https://jornadadoprogresso.com/wp-content/uploads/2026/04/mentoronline.png";

/**
 * Container "Comece aqui — Quebra-Gelo" com estética neomórfica + neon.
 */
export function IceBreakerHero() {
  const { state, setProgress, isCompleted, getProgress } = useIceBreakerProgress();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number>(() => {
    const firstPending = ICE_BREAKER_AUDIOS.findIndex((a) => !state.completed.includes(a.id));
    return firstPending === -1 ? 0 : firstPending;
  });
  const [playing, setPlaying] = useState(false);
  const [xpBurst, setXpBurst] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = ICE_BREAKER_AUDIOS[index];
  const total = ICE_BREAKER_AUDIOS.length;
  const completedCount = state.completed.length;
  const allDone = completedCount === total;
  const pct = Math.round(getProgress(current.id) * 100);
  // 5 estrelas: cada estrela = 2 áudios concluídos
  const starsFilled = Math.min(5, Math.floor(completedCount / 2));

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
      // XP burst dentro do card (sem toast global)
      setXpBurst(15);
      window.setTimeout(() => setXpBurst(null), 1800);
    }
  };

  const onEnded = () => {
    setProgress(current.id, 1);
    setPlaying(false);
    const next = ICE_BREAKER_AUDIOS.findIndex(
      (a, i) => i > index && !state.completed.includes(a.id),
    );
    if (next !== -1) setTimeout(() => setIndex(next), 600);
  };

  const go = (delta: number) => {
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
  };

  // Sombras neomórficas (claras + escuras) na paleta verde escura
  const neuOut =
    "shadow-[8px_8px_20px_hsl(165_50%_3%/0.85),_-6px_-6px_16px_hsl(165_30%_14%/0.45)]";
  const neuIn =
    "shadow-[inset_5px_5px_12px_hsl(165_50%_3%/0.8),_inset_-4px_-4px_10px_hsl(165_30%_14%/0.4)]";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px]",
        "bg-[hsl(165_38%_9%)] text-[hsl(150_20%_96%)]",
        "ring-1 ring-[hsl(var(--primary-glow)/0.55)]",
        neuOut,
        !allDone && "animate-neon-pulse",
      )}
      aria-label="Comece aqui — Áudios Quebra-Gelo do Mentor do Progresso"
    >
      {/* Glow de fundo sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[hsl(var(--primary-glow)/0.28)] blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-[hsl(162_73%_38%/0.28)] blur-3xl" />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary-glow))] shadow-[0_0_10px_hsl(var(--primary-glow))]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary-glow))]">
                Mentor do Progresso · Online
              </span>
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-2xl font-extrabold leading-none tracking-tight">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary-glow))]" />
              Comece Aqui
            </h2>
            <p className="mt-1 text-xs font-semibold text-[hsl(150_20%_82%)]">Quebra-Gelo</p>

            {/* Status + estrelas */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                  "bg-[hsl(165_40%_7%)] text-[hsl(150_20%_92%)]",
                  neuIn,
                )}
              >
                Quebre o gelo · {completedCount}/{total} conselhos
              </span>
              <div
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-1",
                  "bg-[hsl(165_40%_7%)]",
                  neuIn,
                )}
                aria-label={`${starsFilled} de 5 estrelas`}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const on = i < starsFilled;
                  return (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5 transition",
                        on
                          ? "fill-[hsl(45_95%_58%)] text-[hsl(45_95%_58%)] drop-shadow-[0_0_4px_hsl(45_95%_58%/0.8)]"
                          : "text-white/20",
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Avatar do Mentor */}
          <MentorAvatar playing={playing} />
        </div>

        {/* Botão retrátil abaixo do avatar */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Recolher Quebra-Gelo" : "Expandir Quebra-Gelo"}
          aria-expanded={open}
          className="absolute right-8 top-[5.1rem] z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(165_40%_7%)] text-[hsl(var(--primary-glow))] shadow-[inset_3px_3px_8px_hsl(165_50%_3%/0.8),_inset_-2px_-2px_6px_hsl(165_30%_14%/0.45)] transition-smooth active:scale-95"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
        </button>

        {/* XP burst dentro do card */}
        {xpBurst !== null && (
          <div className="pointer-events-none absolute right-5 top-20 z-10 animate-fade-in">
            <div className="rounded-full bg-[hsl(45_95%_58%)] px-3 py-1 text-[11px] font-black text-[hsl(165_40%_8%)] shadow-[0_0_18px_hsl(45_95%_58%/0.7)]">
              +{xpBurst} XP
            </div>
          </div>
        )}

        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            open ? "mt-4 max-h-[24rem] opacity-100" : "mt-0 max-h-0 opacity-0",
          )}
        >
        {/* Bloco atual */}
        <div className={cn("rounded-2xl bg-[hsl(165_40%_7%)] p-3", neuIn)}>
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
        <div className={cn("mt-4 rounded-2xl bg-[hsl(165_40%_7%)] p-3", neuIn)}>
          <SoundWave active={playing} />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Bloco anterior"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition disabled:opacity-30",
                "bg-[hsl(165_38%_9%)]",
                neuOut,
              )}
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
                "shadow-[0_0_24px_hsl(var(--primary-glow)/0.7),_4px_4px_10px_hsl(165_50%_3%/0.7)] transition active:scale-95",
              )}
            >
              {playing ? <Pause className="h-5 w-5" strokeWidth={3} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={3} />}
            </button>

            <div className="min-w-0 flex-1">
              <div className={cn("h-1.5 overflow-hidden rounded-full bg-[hsl(165_40%_5%)]", neuIn)}>
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
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition disabled:opacity-30",
                "bg-[hsl(165_38%_9%)]",
                neuOut,
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
      </div>
    </section>
  );
}

/* ---------- Sub-componentes ---------- */

function MentorAvatar({ playing }: { playing: boolean }) {
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      {/* Halo pulsante */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-[hsl(var(--primary-glow)/0.35)] blur-md",
          playing ? "animate-mentor-orb" : "animate-pulse",
        )}
      />
      {/* Anel neon */}
      <div className="absolute inset-0 rounded-full ring-2 ring-[hsl(var(--primary-glow)/0.85)] shadow-[0_0_18px_hsl(var(--primary-glow)/0.6)]" />
      <div className="absolute inset-[3px] rounded-full ring-1 ring-white/15" />
      {/* Foto */}
      <img
        src={MENTOR_IMG}
        alt="Mentor do Progresso"
        loading="lazy"
        className="relative h-14 w-14 rounded-full object-cover"
      />
      {/* Indicador online */}
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[hsl(var(--primary-glow))] ring-2 ring-[hsl(165_38%_9%)] shadow-[0_0_8px_hsl(var(--primary-glow))]" />
    </div>
  );
}

function SoundWave({ active }: { active: boolean }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => {
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
            animation: active ? `wave-bar 0.9s ease-in-out ${b.delay}s infinite` : undefined,
            opacity: active ? 1 : 0.35,
            transform: active ? undefined : "scaleY(0.4)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
        />
      ))}
      <style>{`@keyframes wave-bar { 0%,100%{transform:scaleY(0.25)} 50%{transform:scaleY(1)} }`}</style>
    </div>
  );
}
