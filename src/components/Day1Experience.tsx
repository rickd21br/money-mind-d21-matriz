import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Target, Trophy, Wallet, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDay1, type ESM } from "@/hooks/useDay1";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { toast } from "sonner";
import { CurrencyInput } from "./CurrencyInput";
import { parseMaskedToNumber } from "@/hooks/useCurrency";
import { formatCurrency } from "@/hooks/useFinance";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ESM_META: Record<ESM, { label: string; emoji: string; cls: string }> = {
  E: { label: "Essencial", emoji: "👍", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  S: { label: "Supérfluo", emoji: "👎", cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  M: { label: "Meta", emoji: "🎯", cls: "border-primary/40 bg-primary/10 text-primary" },
};

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
    expenseTxs,
    esm,
    familyAlignment,
    familyGoal,
    start,
    saveSnapshot,
    classifyTx,
    setFamily,
    dismissCard,
    finish,
  } = useDay1();

  const [hasToday, setHasToday] = useState("");
  const [debt, setDebt] = useState("");
  const [income, setIncome] = useState("");
  const [goal, setGoal] = useState(familyGoal);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (open) start();
  }, [open, start]);

  useEffect(() => {
    if (allDone && !completed) {
      finish();
      setShowFinal(true);
    }
  }, [allDone, completed, finish]);

  const handleSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseMaskedToNumber(hasToday);
    const b = parseMaskedToNumber(debt);
    const c = parseMaskedToNumber(income);
    if (a <= 0 && c <= 0) {
      toast.error("Informe quanto você tem hoje ou quanto entra por mês");
      return;
    }
    saveSnapshot(a, b, c);
    toast.success("Snapshot salvo! Você começou a enxergar.");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[94vh] overflow-y-auto rounded-t-3xl border-0 pb-8">
          <SheetHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dia 1 • Capítulo 1</p>
            <SheetTitle className="text-2xl leading-tight">Planeje antes que fique insustentável</SheetTitle>
            <p className="text-xs text-muted-foreground">Inspirado em Gustavo Cerbasi — referência em finanças pessoais</p>
          </SheetHeader>

          {/* Quote do mentor */}
          <div className="mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="h-4 w-4" /> A dor da falta de planejamento
            </div>
            <p className="mt-2 text-sm italic leading-snug text-foreground">
              “Você já sentiu que, mesmo pagando tudo certinho, o dinheiro nunca sobra?”
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Hoje você vai aprender na prática os 3 pilares do Cerbasi: <b>Orçamento Consciente</b>,{" "}
              <b>Definição de Prioridades</b> e <b>Alinhamento Familiar</b>.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4 rounded-2xl bg-secondary p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progresso do Dia 1</span>
              <span className="text-foreground">{doneCount}/{missions.length} • {progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* PILAR 1 — Snapshot */}
          <div className="mt-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="rounded bg-primary/15 px-1.5 py-0.5">Pilar 1</span>
              Orçamento Consciente
            </h3>
            {!snapshot ? (
              <form onSubmit={handleSnapshot} className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h4 className="text-base font-semibold">Onde você está pisando?</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="has">Tem hoje</Label>
                    <CurrencyInput id="has" value={hasToday} onChange={setHasToday} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="debt">Deve</Label>
                    <CurrencyInput id="debt" value={debt} onChange={setDebt} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="income">Quanto entra por mês?</Label>
                  <CurrencyInput id="income" value={income} onChange={setIncome} />
                </div>
                <Button type="submit" className="h-11 w-full rounded-xl gradient-primary font-semibold">
                  Salvar snapshot
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Reflexão pessoal — não afeta seu saldo real. “Anote tudo. Entrou? Anota. Saiu? Anota.”
                </p>
              </form>
            ) : (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Check className="h-4 w-4" strokeWidth={3} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Snapshot salvo</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Tem</p>
                    <p className="font-bold">{formatCurrency(snapshot.hasToday)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Deve</p>
                    <p className="font-bold">{formatCurrency(snapshot.debt)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Entra/mês</p>
                    <p className="font-bold">{formatCurrency(snapshot.monthlyIncome)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Missões */}
          <div className="mt-4 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Missões do dia
            </h3>
            <ul className="space-y-2">
              {missions.map((m) => (
                <li key={m.id} className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 transition-smooth",
                  m.done ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                )}>
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    m.done ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {m.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-xs">•</span>}
                  </div>
                  <span className={cn("flex-1 text-sm", m.done ? "font-semibold" : "text-foreground")}>
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA registrar */}
          {!allDone && (
            <div className="mt-4">
              <AddTransactionDialog
                trigger={
                  <Button size="lg" className="h-12 w-full rounded-xl gradient-primary text-base font-semibold">
                    + Registrar entrada ou saída
                  </Button>
                }
              />
            </div>
          )}

          {/* PILAR 2 — Classificador E/S/M */}
          {expenseTxs.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="rounded bg-primary/15 px-1.5 py-0.5">Pilar 2</span>
                Definição de Prioridades — E / S / M
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Para cada gasto pergunte: <i>“Isso me aproxima da vida que quero ou só me distrai dela?”</i>
              </p>
              <ul className="space-y-2">
                {expenseTxs.slice(0, 6).map((tx) => {
                  const cur = esm[tx.id];
                  return (
                    <li key={tx.id} className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{tx.description || tx.category}</p>
                          <p className="text-[11px] text-muted-foreground">{formatCurrency(tx.amount)} • {tx.category}</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {(["E", "S", "M"] as ESM[]).map((opt) => {
                          const active = cur === opt;
                          const meta = ESM_META[opt];
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => classifyTx(tx.id, opt)}
                              className={cn(
                                "flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-smooth",
                                active ? meta.cls : "border-border bg-background text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <span>{meta.emoji}</span>
                              <span>{meta.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* PILAR 3 — Alinhamento familiar */}
          <div className="mt-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="rounded bg-primary/15 px-1.5 py-0.5">Pilar 3</span>
              Alinhamento Familiar
            </h3>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Quem decide o dinheiro com você?</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFamily("alone", goal)}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-semibold transition-smooth",
                    familyAlignment === "alone" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                  )}
                >
                  Decido sozinho(a)
                </button>
                <button
                  type="button"
                  onClick={() => setFamily("shared", goal)}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-semibold transition-smooth",
                    familyAlignment === "shared" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                  )}
                >
                  Divido com alguém
                </button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal">Qual sua primeira meta financeira?</Label>
                <Input
                  id="goal"
                  placeholder="Ex.: reserva de R$ 500"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onBlur={() => familyAlignment && setFamily(familyAlignment, goal)}
                  className="h-11 rounded-xl"
                />
              </div>
              <p className="text-[11px] italic text-muted-foreground">
                “Família unida no planejamento é mais forte na realização.” — Cerbasi
              </p>
            </div>
          </div>

          {/* Card dinâmico */}
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

          {xp > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
              <Trophy className="h-4 w-4" />
              {xp} XP conquistado
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Final reward */}
      <Sheet open={showFinal} onOpenChange={setShowFinal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-0 pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary shadow-glow">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Capítulo 1 concluído • +50 XP</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Você praticou os 3 pilares do Cerbasi: enxergou, priorizou e alinhou. Amanhã: Dave Ramsey e a Bola de Neve das Dívidas.
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl font-semibold"
                onClick={() => { setShowFinal(false); onOpenChange(false); navigate("/relatorios"); }}
              >
                Ver meus dados
              </Button>
              <Button
                className="h-12 rounded-xl gradient-primary font-semibold"
                onClick={() => { setShowFinal(false); onOpenChange(false); }}
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
