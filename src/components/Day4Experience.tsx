import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Check, Trophy, BookOpen, Sparkles, Trash2, ArrowDownCircle,
  ArrowUpCircle, Target, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDay4, AssetType } from "@/hooks/useDay4";
import { CurrencyInput } from "./CurrencyInput";
import { parseMaskedToNumber } from "@/hooks/useCurrency";
import { formatCurrency } from "@/hooks/useFinance";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_META: Record<AssetType, { label: string; hint: string; Icon: typeof ArrowUpCircle; tone: string }> = {
  ativo:   { label: "Ativo",   hint: "Coloca dinheiro no seu bolso (aluguel, dividendo, royalty)", Icon: ArrowUpCircle,   tone: "text-emerald-600" },
  passivo: { label: "Passivo", hint: "Tira dinheiro do seu bolso (financiamento, parcela, juros)", Icon: ArrowDownCircle, tone: "text-rose-600" },
};

/**
 * Dia 4 — Capítulo 4 do sumário: Robert Kiyosaki (Pai Rico, Pai Pobre).
 * Conceitos centrais:
 *  • Ativo coloca dinheiro no bolso. Passivo tira.
 *  • Os ricos compram ativos; os pobres acumulam passivos disfarçados.
 *  • Fluxo Patrimonial = Ativos − Passivos (mensal).
 *  • Educação financeira > renda alta.
 */
export function Day4Experience({ open, onOpenChange }: Props) {
  const {
    items, nextAsset, totals,
    missions, doneCount, progress, allDone, pendingCard,
    xp, completed,
    addItem, removeItem, setNextAsset, acknowledge,
    dismissCard, finish,
  } = useDay4();

  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("ativo");
  const [value, setValue] = useState("");
  const [nextInput, setNextInput] = useState(nextAsset);
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
    if (!name.trim()) { toast.error("Dê um nome ao item"); return; }
    if (v <= 0) { toast.error("Informe o valor mensal"); return; }
    addItem({ name: name.trim(), type, monthly: v });
    setName(""); setValue("");
    toast.success(`${type === "ativo" ? "Ativo" : "Passivo"} cadastrado`);
  };

  const handleSetNext = () => {
    setNextAsset(nextInput.trim());
    if (nextInput.trim().length > 2) toast.success("Compromisso registrado");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[94vh] overflow-y-auto rounded-t-3xl border-0 pb-8">
          <SheetHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dia 4 • Capítulo 4</p>
            <SheetTitle className="text-2xl">Ativos vs Passivos</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Robert Kiyosaki — Pai Rico, Pai Pobre. Aprenda a regra de ouro da riqueza.
            </p>
          </SheetHeader>

          {/* Progresso */}
          <div className="mt-4 rounded-2xl bg-secondary p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Missões</span>
              <span className="text-primary">{doneCount}/{missions.length}</span>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
            <ul className="mt-3 space-y-1.5">
              {missions.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    m.done ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {m.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={m.done ? "line-through text-muted-foreground" : ""}>{m.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regra de ouro */}
          <button
            onClick={() => acknowledge("mindsetUnderstood")}
            className={cn(
              "mt-4 w-full rounded-2xl p-4 text-left transition-smooth",
              "bg-primary/5 hover:bg-primary/10"
            )}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-primary">
              <Lightbulb className="h-3.5 w-3.5" /> Regra de Ouro
            </div>
            <p className="mt-1.5 text-sm leading-snug">
              <strong>Ativo</strong> = coloca dinheiro no seu bolso.
              <br />
              <strong>Passivo</strong> = tira dinheiro do seu bolso.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {missions.find(m => m.id === "mind")?.done ? "✓ Compreendido" : "Toque para confirmar que entendeu"}
            </p>
          </button>

          {/* Cadastro */}
          <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Cadastrar item
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_META) as AssetType[]).map((t) => {
                const M = TYPE_META[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-smooth",
                      type === t ? "border-primary bg-primary/5" : "border-border bg-background"
                    )}
                  >
                    <M.Icon className={cn("h-4 w-4", M.tone)} />
                    <span className="text-xs font-bold">{M.label}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{M.hint}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Aluguel recebido / Financiamento carro" />
            </div>
            <div>
              <Label className="text-xs">Valor mensal</Label>
              <CurrencyInput value={value} onChange={setValue} placeholder="0,00" />
            </div>
            <Button type="submit" className="w-full gradient-primary">Adicionar</Button>
          </form>

          {/* Lista */}
          {items.length > 0 && (
            <div className="mt-4 space-y-2">
              {items.map((i) => {
                const M = TYPE_META[i.type];
                return (
                  <div key={i.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                    <M.Icon className={cn("h-5 w-5 shrink-0", M.tone)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{i.name}</p>
                      <p className="text-[11px] text-muted-foreground">{M.label} • {formatCurrency(i.monthly)}/mês</p>
                    </div>
                    <button onClick={() => removeItem(i.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fluxo patrimonial */}
          {items.length > 0 && (
            <div className="mt-4 rounded-2xl gradient-card p-4 text-primary-foreground shadow-elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Fluxo Patrimonial mensal</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(totals.fluxo)}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] opacity-95">
                <div className="rounded-lg bg-white/10 p-2">
                  <p className="opacity-80">Ativos</p>
                  <p className="font-bold">{formatCurrency(totals.ativos)}</p>
                </div>
                <div className="rounded-lg bg-white/10 p-2">
                  <p className="opacity-80">Passivos</p>
                  <p className="font-bold">{formatCurrency(totals.passivos)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Próximo ativo */}
          <div className="mt-4 rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> Próximo ativo
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Que ativo você se compromete a adquirir? (curso, aplicação, equipamento que gera renda...)
            </p>
            <Input
              value={nextInput}
              onChange={(e) => setNextInput(e.target.value)}
              onBlur={handleSetNext}
              placeholder="Ex.: Tesouro Selic, FII de papel, curso técnico"
              className="mt-2"
            />
          </div>

          {/* Gatilho emergente */}
          {pendingCard && (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Insight
              </div>
              <p className="mt-1.5 text-sm italic leading-snug">"{pendingCard.text}"</p>
              <Button size="sm" variant="ghost" className="mt-2 h-8 text-xs" onClick={() => dismissCard(pendingCard.id)}>
                Entendi
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Conclusão */}
      <Sheet open={showFinal} onOpenChange={setShowFinal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-0 pb-8">
          <SheetHeader className="text-left">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Trophy className="h-7 w-7" />
            </div>
            <SheetTitle className="text-2xl">Dia 4 concluído!</SheetTitle>
          </SheetHeader>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Você dominou a regra de ouro de Kiyosaki: <strong>ativos enriquecem, passivos empobrecem</strong>.
            +60 XP adicionados. Seu próximo ativo já tem nome.
          </p>
          <Button className="mt-4 h-14 w-full gradient-primary text-base font-semibold" onClick={() => { setShowFinal(false); onOpenChange(false); }}>
            Continuar jornada
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">XP total Dia 4: +{xp}</p>
        </SheetContent>
      </Sheet>
    </>
  );
}
