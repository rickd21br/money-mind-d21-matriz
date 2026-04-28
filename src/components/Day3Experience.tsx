import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Check, Trophy, BookOpen, Sparkles, Trash2, TrendingUp,
  Target, ArrowRight, Briefcase, Coins, Bot, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDay3, IncomeSourceType } from "@/hooks/useDay3";
import { CurrencyInput } from "./CurrencyInput";
import { parseMaskedToNumber } from "@/hooks/useCurrency";
import { formatCurrency } from "@/hooks/useFinance";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_META: Record<IncomeSourceType, { label: string; hint: string; Icon: typeof Briefcase }> = {
  ativa:      { label: "Ativa",      hint: "Trabalho/serviço (CLT, freela)", Icon: Briefcase },
  passiva:    { label: "Passiva",    hint: "Aluguel, royalties, infoproduto", Icon: Coins },
  automatica: { label: "Automática", hint: "Juros, dividendos, FIIs",         Icon: Bot },
};

/**
 * Dia 3 — Capítulo 3 do sumário: Tiago Nigro (Primo Rico).
 * Conceitos centrais:
 *  • Mentalidade de investidor: faça o dinheiro trabalhar por você.
 *  • Diversificação de fontes (ativa, passiva, automática).
 *  • Pirâmide financeira: Reserva → Proteção → Crescimento.
 *  • Constância > intensidade (% mensal de investimento).
 */
export function Day3Experience({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const {
    sources, totals, investPercent,
    missions, doneCount, progress, allDone, pendingCard,
    xp, completed,
    addSource, removeSource, setInvestPercent, acknowledge,
    dismissCard, finish,
  } = useDay3();

  const [name, setName] = useState("");
  const [type, setType] = useState<IncomeSourceType>("ativa");
  const [value, setValue] = useState("");
  const [pctInput, setPctInput] = useState(investPercent > 0 ? String(investPercent) : "");
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (allDone && !completed) {
      finish();
      setShowFinal(true);
    }
  }, [allDone, completed, finish]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseMaskedToNumber(value);
    if (!name.trim()) { toast.error("Dê um nome à fonte"); return; }
    if (v <= 0) { toast.error("Informe o valor mensal"); return; }
    addSource({ name: name.trim(), type, monthly: v });
    setName(""); setValue("");
    toast.success("Fonte de renda adicionada");
  };

  const handleSetPct = () => {
    const v = parseInt(pctInput.replace(/\D/g, ""), 10) || 0;
    setInvestPercent(v);
    if (v > 0) toast.success(`${v}% definido para investimentos`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[94vh] overflow-y-auto rounded-t-3xl border-0 pb-8">
          <SheetHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dia 3 • Capítulo 3</p>
            <SheetTitle className="text-2xl leading-tight">Faça o dinheiro trabalhar por você</SheetTitle>
            <p className="text-xs text-muted-foreground">Inspirado em Tiago Nigro (Primo Rico) — Mentalidade de Investidor</p>
          </SheetHeader>

          {/* Quote do mentor */}
          <div className="mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="h-4 w-4" /> A virada de chave
            </div>
            <p className="mt-2 text-sm italic leading-snug text-foreground">
              “Não trabalhe pelo dinheiro. Faça o dinheiro trabalhar para você.” — Tiago Nigro
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Quem vive de <b>1 fonte</b> é refém dela. O investidor cria pelo menos <b>3 camadas</b>:
              <b> ativa</b> (trabalho), <b>passiva</b> (recorrente) e <b>automática</b> (juros/dividendos).
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4 rounded-2xl bg-secondary p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progresso do Dia 3</span>
              <span className="text-foreground">{doneCount}/{missions.length} • {progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* PASSO 1 — Mapear fontes */}
          <div className="mt-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="rounded bg-primary/15 px-1.5 py-0.5">Passo 1</span>
              Mapeie suas fontes de renda
            </h3>

            <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-name">Nome da fonte</Label>
                <Input
                  id="s-name"
                  placeholder="Ex.: Salário, Aluguel, Dividendos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TYPE_META) as IncomeSourceType[]).map((t) => {
                    const M = TYPE_META[t];
                    const active = type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-semibold transition-smooth",
                          active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                        )}
                      >
                        <M.Icon className="h-4 w-4" />
                        {M.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">{TYPE_META[type].hint}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="s-val">Valor mensal</Label>
                <CurrencyInput id="s-val" value={value} onChange={setValue} />
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl gradient-primary font-semibold">
                Adicionar fonte
              </Button>
            </form>

            {sources.length > 0 && (
              <ul className="mt-3 space-y-2">
                {sources.map((s) => {
                  const M = TYPE_META[s.type];
                  return (
                    <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <M.Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{M.label} • {formatCurrency(s.monthly)}/mês</p>
                      </div>
                      <button
                        onClick={() => removeSource(s.id)}
                        aria-label="Remover fonte"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {sources.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/40 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ativa</p>
                  <p className="text-sm font-bold">{formatCurrency(totals.ativa)}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Passiva</p>
                  <p className="text-sm font-bold">{formatCurrency(totals.passiva)}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Automática</p>
                  <p className="text-sm font-bold">{formatCurrency(totals.automatica)}</p>
                </div>
              </div>
            )}
          </div>

          {/* PASSO 2 — % de investimento */}
          {sources.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="rounded bg-primary/15 px-1.5 py-0.5">Passo 2</span>
                Quanto da renda você vai investir?
              </h3>
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pct">% da renda mensal</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="pct"
                        inputMode="numeric"
                        placeholder="0"
                        value={pctInput}
                        onChange={(e) => setPctInput(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="h-12 rounded-xl pr-10 text-lg font-semibold"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</span>
                    </div>
                    <Button type="button" onClick={handleSetPct} className="h-12 rounded-xl gradient-primary px-4">
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Meta Primo Rico: 20–30% da renda mensal.</p>
                </div>

                {investPercent > 0 && totals.total > 0 && (
                  <div className="rounded-xl bg-primary/5 p-3 text-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Sua projeção</p>
                    </div>
                    <p className="mt-1.5">
                      Investindo <b>{investPercent}%</b> de <b>{formatCurrency(totals.total)}</b>/mês:
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-card p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Por mês</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(totals.monthlyInvest)}</p>
                      </div>
                      <div className="rounded-lg bg-card p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Em 12 meses</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(totals.yearInvest)}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] italic text-muted-foreground">
                      *Sem considerar juros compostos. Com 0,8%/mês, esse valor cresce ainda mais (Cap. 8 — Buffett).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASSO 3 — Pirâmide */}
          <div className="mt-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="rounded bg-primary/15 px-1.5 py-0.5">Passo 3</span>
              A Pirâmide Financeira
            </h3>
            <button
              onClick={() => {
                acknowledge("pyramidUnderstood");
                toast.success("Pirâmide compreendida!");
              }}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-smooth",
                missions[3].done ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2">
                  <Layers className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">1. Reserva de Emergência</p>
                    <p className="text-[10px] text-muted-foreground">6–12 meses de gastos. Liquidez total.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2">
                  <Layers className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">2. Proteção</p>
                    <p className="text-[10px] text-muted-foreground">Seguros, previdência. Blindagem patrimonial.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">3. Crescimento</p>
                    <p className="text-[10px] text-muted-foreground">Renda variável, FIIs, ações. Multiplicação.</p>
                  </div>
                </div>
              </div>
              {!missions[3].done && (
                <p className="mt-3 text-center text-xs font-semibold text-primary">Toque para confirmar entendimento</p>
              )}
              {missions[3].done && (
                <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> Pirâmide compreendida
                </p>
              )}
            </button>
          </div>

          {/* Missões */}
          <div className="mt-5 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" /> Missões do dia
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
              <Trophy className="h-4 w-4" /> {xp} XP conquistado
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Final reward */}
      <Sheet open={showFinal} onOpenChange={setShowFinal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-0 pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary shadow-glow">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Capítulo 3 concluído • +60 XP</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Você assumiu a mentalidade de investidor: mapeou suas fontes, definiu sua taxa de poupança
              e entendeu a pirâmide. Amanhã: Thiago Perini e o poder da rotina financeira.
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
                Continuar jornada <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
