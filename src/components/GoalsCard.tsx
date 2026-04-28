import { useMemo, useState } from "react";
import { useGoals, formatCurrency } from "@/hooks/useFinance";
import { Goal } from "@/types";
import { Target, Plus, Pencil, Trash2, Check, X as XIcon, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";
import { CurrencyInput } from "./CurrencyInput";
import { parseMaskedToNumber, formatNumberInput, useCurrency } from "@/hooks/useCurrency";

/** Mensagem de impacto baseada no progresso da meta — gatilhos emocionais. */
function getEmotionalCue(g: Goal): { tag: string; line: string; tone: "alert" | "positive" | "neutral" } {
  const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
  const dream = g.dream || g.title;
  if (pct >= 100) return {
    tag: "🏆 Meta conquistada",
    line: `Você provou para si mesmo que dá conta. "${dream}" agora é realidade.`,
    tone: "positive",
  };
  if (pct >= 75) return {
    tag: "🔥 Reta final",
    line: `Faltam só ${Math.round(100 - pct)}%. Lembra por que começou? "${dream}" está logo ali.`,
    tone: "positive",
  };
  if (pct >= 25) return {
    tag: "🚀 Em ritmo",
    line: `Cada aporte aproxima você de "${dream}". Não pare agora.`,
    tone: "neutral",
  };
  if (g.deadline) {
    const dDays = differenceInDays(parseISO(g.deadline), new Date());
    if (dDays >= 0 && dDays < 30) return {
      tag: "⚠️ Prazo apertado",
      line: `${dDays} dias para "${dream}". Cada supérfluo cortado vira meta.`,
      tone: "alert",
    };
  }
  return {
    tag: "💡 Comece pequeno",
    line: `O primeiro R$ 10 vale mais que os próximos R$ 1.000. Dê o primeiro passo rumo a "${dream}".`,
    tone: "neutral",
  };
}

interface GoalFormProps {
  initial?: Goal;
  onSubmit: (data: Omit<Goal, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function GoalForm({ initial, onSubmit, onCancel }: GoalFormProps) {
  const { code } = useCurrency();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [target, setTarget] = useState(initial ? formatNumberInput(initial.target, code) : "");
  const [saved, setSaved] = useState(initial ? formatNumberInput(initial.saved, code) : "");
  const [dream, setDream] = useState(initial?.dream ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseMaskedToNumber(target);
    const s = parseMaskedToNumber(saved);
    if (!title.trim()) { toast.error("Dê um nome à meta"); return; }
    if (!t || t <= 0) { toast.error("Informe o valor alvo"); return; }
    onSubmit({ title: title.trim(), target: t, saved: s, dream: dream.trim() || undefined, deadline: deadline || undefined });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="g-title">Título</Label>
        <Input id="g-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reserva de emergência" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="g-dream">Por que essa meta importa?</Label>
        <Input id="g-dream" value={dream} onChange={(e) => setDream(e.target.value)} placeholder="Seu sonho/projeto em uma frase" className="h-11 rounded-xl" />
        <p className="text-[10px] text-muted-foreground">Usaremos essa frase nos lembretes para manter você focado.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="g-target">Valor alvo</Label>
          <CurrencyInput id="g-target" value={target} onChange={setTarget} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-saved">Já guardado</Label>
          <CurrencyInput id="g-saved" value={saved} onChange={setSaved} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="g-deadline">Prazo (opcional)</Label>
        <Input id="g-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 flex-1 rounded-xl">Cancelar</Button>
        <Button type="submit" className="h-11 flex-1 rounded-xl gradient-primary">{initial ? "Salvar" : "Criar meta"}</Button>
      </div>
    </form>
  );
}

export function GoalsCard() {
  const { goals, addGoal, updateGoal, removeGoal, contribute } = useGoals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contribFor, setContribFor] = useState<string | null>(null);
  const [contribValue, setContribValue] = useState("");

  const primary = goals[0];
  const cue = useMemo(() => primary ? getEmotionalCue(primary) : null, [primary]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (g: Goal) => { setEditing(g); setOpen(true); };

  const handleSubmit = (data: Omit<Goal, "id" | "createdAt">) => {
    if (editing) { updateGoal(editing.id, data); toast.success("Meta atualizada"); }
    else { addGoal(data); toast.success("Meta criada — você acaba de mirar mais alto"); }
    setOpen(false); setEditing(null);
  };

  const handleContribute = (id: string) => {
    const v = parseMaskedToNumber(contribValue);
    if (!v || v <= 0) { toast.error("Informe um valor"); return; }
    contribute(id, v);
    setContribFor(null); setContribValue("");
    toast.success("Aporte registrado!");
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Target className="h-4 w-4 text-primary" />
          Suas metas
        </h2>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              <Plus className="h-3.5 w-3.5" /> Nova
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-3xl">
            <DialogHeader><DialogTitle>{editing ? "Editar meta" : "Nova meta"}</DialogTitle></DialogHeader>
            <GoalForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Defina sua primeira meta</p>
          <p className="mt-1 text-xs text-muted-foreground">
            "Quem não sabe para onde vai, qualquer dinheiro serve" — Cerbasi.
          </p>
          <Button onClick={openCreate} size="sm" className="mt-3 h-9 rounded-xl gradient-primary text-xs">
            Criar minha meta
          </Button>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            const cueG = getEmotionalCue(g);
            return (
              <li key={g.id} className="rounded-2xl border border-border bg-background/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{g.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(g.saved)} <span className="opacity-60">de {formatCurrency(g.target)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button onClick={() => openEdit(g)} aria-label="Editar meta" className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm(`Excluir meta "${g.title}"?`)) { removeGoal(g.id); toast.success("Meta removida"); } }} aria-label="Excluir meta" className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-success" : "gradient-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Mensagem emocional */}
                <p className={cn(
                  "mt-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium leading-snug",
                  cueG.tone === "alert" && "bg-danger/10 text-danger",
                  cueG.tone === "positive" && "bg-success/10 text-success",
                  cueG.tone === "neutral" && "bg-primary/10 text-primary",
                )}>
                  <span className="font-bold">{cueG.tag}</span> · {cueG.line}
                </p>

                {/* Aporte rápido */}
                {contribFor === g.id ? (
                  <div className="mt-2 flex gap-1.5">
                    <div className="flex-1">
                      <CurrencyInput
                        value={contribValue}
                        onChange={setContribValue}
                        placeholder="Valor do aporte"
                        autoFocus
                      />
                    </div>
                    <button onClick={() => handleContribute(g.id)} className="rounded-lg bg-success/15 px-2.5 text-success hover:bg-success/25">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setContribFor(null); setContribValue(""); }} className="rounded-lg bg-muted px-2.5 text-muted-foreground hover:bg-muted/70">
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setContribFor(g.id); setContribValue(""); }}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/5"
                  >
                    <TrendingUp className="h-3 w-3" /> Aportar agora
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
