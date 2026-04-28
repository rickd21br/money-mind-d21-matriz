import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Target, Trophy, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDay1 } from "@/hooks/useDay1";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Day1Experience({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const {
    snapshot,
    missions,
    progress,
    doneCount,
    allDone,
    pendingCard,
    xp,
    completed,
    start,
    saveSnapshot,
    dismissCard,
    finish,
  } = useDay1();

  const [hasToday, setHasToday] = useState("");
  const [debt, setDebt] = useState("");
  const [showFinal, setShowFinal] = useState(false);

  // Mark Day 1 as started when sheet opens
  useEffect(() => {
    if (open) start();
  }, [open, start]);

  // Auto-show final card when all missions complete
  useEffect(() => {
    if (allDone && !completed) {
      finish();
      setShowFinal(true);
    }
  }, [allDone, completed, finish]);

  const handleSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(hasToday.replace(",", ".")) || 0;
    const b = parseFloat(debt.replace(",", ".")) || 0;
    if (a <= 0) {
      toast.error("Informe quanto você tem hoje");
      return;
    }
    saveSnapshot(a, b);
    toast.success("Snapshot salvo!");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl border-0 pb-8">
          <SheetHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dia 1</p>
            <SheetTitle className="text-2xl">O primeiro passo</SheetTitle>
          </SheetHeader>

          {/* Progress */}
          <div className="mt-4 rounded-2xl bg-secondary p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progresso do dia</span>
              <span className="text-foreground">{doneCount}/{missions.length} • {progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Snapshot card */}
          {!snapshot ? (
            <form onSubmit={handleSnapshot} className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Você sabe para onde seu dinheiro vai?</h3>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="has">Quanto você tem hoje? (R$)</Label>
                <Input
                  id="has"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={hasToday}
                  onChange={(e) => setHasToday(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="debt">Quanto você deve? (opcional)</Label>
                <Input
                  id="debt"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl gradient-primary font-semibold">
                Salvar snapshot
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Esses valores ficam salvos só para sua reflexão. Não afetam seu saldo real.
              </p>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Check className="h-4 w-4" strokeWidth={3} />
                <span className="text-xs font-semibold uppercase tracking-wide">Snapshot inicial</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Tem hoje</p>
                  <p className="font-bold">R$ {snapshot.hasToday.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deve</p>
                  <p className="font-bold">R$ {snapshot.debt.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Missions */}
          <div className="mt-4 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Missões do dia
            </h3>
            <ul className="space-y-2">
              {missions.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 transition-smooth",
                    m.done ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      m.done ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {m.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-xs">•</span>}
                  </div>
                  <span className={cn("flex-1 text-sm", m.done ? "font-semibold" : "text-foreground")}>
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA: nova transação */}
          {!allDone && (
            <div className="mt-4">
              <AddTransactionDialog
                trigger={
                  <Button size="lg" className="h-12 w-full rounded-xl gradient-primary text-base font-semibold">
                    + Registrar uma transação agora
                  </Button>
                }
              />
            </div>
          )}

          {/* Dynamic feedback card */}
          {pendingCard && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug text-foreground">{pendingCard.text}</p>
                  <button
                    onClick={() => dismissCard(pendingCard.id)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* XP indicator */}
          {xp > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
              <Trophy className="h-4 w-4" />
              {xp} XP conquistado
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Final reward sheet */}
      <Sheet open={showFinal} onOpenChange={setShowFinal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-0 pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary shadow-glow">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-bold">+50 XP</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Agora você começou a enxergar sua realidade financeira.
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl font-semibold"
                onClick={() => {
                  setShowFinal(false);
                  onOpenChange(false);
                  navigate("/relatorios");
                }}
              >
                Ver meus dados
              </Button>
              <Button
                className="h-12 rounded-xl gradient-primary font-semibold"
                onClick={() => {
                  setShowFinal(false);
                  onOpenChange(false);
                }}
              >
                Continuar jornada
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
