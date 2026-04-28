import { MobileShell } from "@/components/MobileShell";
import { JOURNEY_DAYS } from "@/data/journey";
import { useJourney } from "@/hooks/useFinance";
import { Check, Lock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Day1Experience } from "@/components/Day1Experience";
import { Day2Experience } from "@/components/Day2Experience";
import { Day3Experience } from "@/components/Day3Experience";
import { Day4Experience } from "@/components/Day4Experience";

const Journey = () => {
  const { isCompleted, toggleDay, progress } = useJourney();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const percent = Math.round((progress / 21) * 100);

  const current = openDay ? JOURNEY_DAYS.find((d) => d.day === openDay) : null;

  return (
    <MobileShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Jornada de 21 dias</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pequenos passos, grandes mudanças.</p>
      </header>

      <section className="mb-6 rounded-3xl gradient-card p-5 text-primary-foreground shadow-elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-90">Seu progresso</p>
            <p className="mt-0.5 text-3xl font-bold">{progress}/21</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Concluído</p>
            <p className="mt-0.5 text-2xl font-bold">{percent}%</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      <ul className="space-y-3">
        {JOURNEY_DAYS.map((d, idx) => {
          const done = isCompleted(d.day);
          const prevDone = idx === 0 || isCompleted(JOURNEY_DAYS[idx - 1].day);
          const locked = !done && !prevDone;
          return (
            <li key={d.day}>
              <button
                onClick={() => !locked && setOpenDay(d.day)}
                disabled={locked}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-soft transition-smooth",
                  !locked && "active:scale-[0.98]",
                  locked && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                    done ? "gradient-primary text-primary-foreground shadow-glow" : locked ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : locked ? <Lock className="h-4 w-4" /> : d.day}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dia {d.day}</p>
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                </div>
                <Target className={cn("h-4 w-4", done ? "text-primary" : "text-muted-foreground")} />
              </button>
            </li>
          );
        })}
      </ul>

      <Day1Experience open={openDay === 1} onOpenChange={(o) => !o && setOpenDay(null)} />
      <Day2Experience open={openDay === 2} onOpenChange={(o) => !o && setOpenDay(null)} />
      <Day3Experience open={openDay === 3} onOpenChange={(o) => !o && setOpenDay(null)} />
      <Day4Experience open={openDay === 4} onOpenChange={(o) => !o && setOpenDay(null)} />

      <Sheet open={openDay !== null && ![1, 2, 3, 4].includes(openDay)} onOpenChange={(o) => !o && setOpenDay(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-0 pb-8">
          {current && (
            <>
              <SheetHeader className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dia {current.day}</p>
                <SheetTitle className="text-2xl">{current.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missão</p>
                  <p className="mt-1 font-semibold">{current.mission}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{current.description}</p>
                <Button
                  size="lg"
                  className={cn(
                    "h-14 w-full rounded-2xl text-base font-semibold",
                    isCompleted(current.day) ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "gradient-primary"
                  )}
                  onClick={() => {
                    toggleDay(current.day);
                    setOpenDay(null);
                  }}
                >
                  {isCompleted(current.day) ? "Desmarcar dia" : "Concluir dia"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
};

export default Journey;
