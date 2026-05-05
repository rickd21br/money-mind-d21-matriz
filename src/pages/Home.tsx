import { useRef, useState } from "react";
import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { MobileShell } from "@/components/MobileShell";
import { MentorCard } from "@/components/MentorCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { GoalsCard } from "@/components/GoalsCard";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { IceBreakerHero } from "@/components/IceBreakerHero";
import { ArrowDownRight, ArrowUpRight, Wallet, Receipt, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HOME_ACTIONS = [
  {
    title: "Bônus Exclusivo",
    to: "/audios",
    image: "https://jornadadoprogresso.com/wp-content/uploads/2026/04/sliderhome1.png",
  },
  {
    title: "Meu Negócio",
    to: "/meu-negocio",
    image: new URL("@/assets/card-meu-negocio.png", import.meta.url).href,
  },
  {
    title: "Vitrine de Infoprodutos",
    to: "/vitrine",
    image: new URL("@/assets/card-vitrine.png", import.meta.url).href,
  },
  {
    title: "Calculadora",
    to: "/calculadora",
    image: "https://jornadadoprogresso.com/wp-content/uploads/2026/04/sliderhome2.png",
  },
  {
    title: "Trilha de aprendizado",
    to: "/audios",
    image: "https://jornadadoprogresso.com/wp-content/uploads/2026/04/sliderhome3.png",
  },
];

const Home = () => {
  const { transactions, totals, removeTransaction } = useTransactions();
  const recent = transactions.slice(0, 6);
  const balancePositive = totals.balance >= 0;
  const [editing, setEditing] = useState<Transaction | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [activeAction, setActiveAction] = useState(0);

  const scrollAction = (direction: "left" | "right") => {
    const next = direction === "left" ? Math.max(activeAction - 1, 0) : Math.min(activeAction + 1, HOME_ACTIONS.length - 1);
    setActiveAction(next);
    actionsRef.current?.querySelectorAll<HTMLElement>("[data-home-action]")[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handleActionScroll = () => {
    const el = actionsRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-home-action]"));
    const closest = cards.reduce((best, card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveAction(closest.index);
  };

  const classBadge = (c?: Transaction["classification"]) => {
    if (!c) return null;
    const map = {
      essencial: { label: "Essencial", cls: "bg-emerald-500/10 text-emerald-600" },
      superfluo: { label: "Supérfluo", cls: "bg-amber-500/10 text-amber-600" },
      meta: { label: "Meta", cls: "bg-primary/10 text-primary" },
    } as const;
    const m = map[c];
    return <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", m.cls)}>{m.label}</span>;
  };

  return (
    <MobileShell>
      {/* MENTOR DO PROGRESSO ONLINE — primeiro acesso */}
      <IceBreakerHero />

      {/* SALDO */}
      <section className="relative mt-5 overflow-hidden rounded-3xl gradient-card p-6 text-primary-foreground shadow-elevated">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-2 text-xs font-medium opacity-90">
          <Wallet className="h-4 w-4" />
          <span>Saldo atual</span>
        </div>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatCurrency(totals.balance)}</p>
        <p className="mt-1 text-[11px] font-medium opacity-80">
          {balancePositive ? "Você está no controle. Continue assim." : "Atenção: o vermelho é um aviso, não uma sentença."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-l-4 border-success bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-95">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/90">
                <ArrowUpRight className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              Entradas
            </div>
            <p className="mt-1.5 text-lg font-bold leading-tight">{formatCurrency(totals.income)}</p>
          </div>
          <div className="rounded-2xl border-l-4 border-danger bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-95">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/90">
                <ArrowDownRight className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              Saídas
            </div>
            <p className="mt-1.5 text-lg font-bold leading-tight">{formatCurrency(totals.expense)}</p>
          </div>
        </div>
      </section>

      {/* INÍCIO — 3 cards abaixo do Mentor */}
      <section className="mt-5 overflow-visible">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Início</p>
            <h2 className="text-base font-bold tracking-tight">Continue sua jornada</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Card anterior" onClick={() => scrollAction("left")} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary shadow-soft transition-smooth active:scale-95">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Próximo card" onClick={() => scrollAction("right")} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary shadow-soft transition-smooth active:scale-95">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={actionsRef}
          onScroll={handleActionScroll}
          className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible px-8 pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {HOME_ACTIONS.map((action, index) => {
            const active = activeAction === index;
            return (
              <Link
                key={action.title}
                to={action.to}
                data-home-action
                className={cn(
                  "relative block min-w-[76%] snap-center overflow-hidden rounded-[1.15rem] bg-card shadow-floating transition-all duration-300 first:ml-0 active:scale-[0.98] sm:min-w-[68%]",
                  active
                    ? "z-40 translate-y-0 scale-100 opacity-100"
                    : "z-0 translate-y-3 scale-[0.94] opacity-70"
                )}
              >
                <img src={action.image} alt={action.title} loading="lazy" className="aspect-[9/13] w-full object-cover" />
              </Link>
            );
          })}
        </div>
        <div className="flex justify-center gap-1.5" aria-label="Controle do carrossel">
          {HOME_ACTIONS.map((action, index) => (
            <button
              key={action.title}
              type="button"
              aria-label={`Ir para ${action.title}`}
              onClick={() => {
                setActiveAction(index);
                actionsRef.current?.querySelectorAll<HTMLElement>("[data-home-action]")[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              className={cn("h-1.5 rounded-full transition-all", activeAction === index ? "w-5 bg-primary" : "w-1.5 bg-primary/20")}
            />
          ))}
        </div>
      </section>

      <div className="mt-5"><MentorCard /></div>

      {/* METAS — controle gamificado */}
      <div className="mt-5"><GoalsCard /></div>

      <div className="mt-5"><WeeklyChart /></div>

      {/* TRANSAÇÕES RECENTES */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Receipt className="h-4 w-4 text-primary" /> Transações recentes
          </h2>
          {recent.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">{transactions.length} no total</span>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação ainda.<br />
              Toque no <span className="font-semibold text-primary">+</span> para começar.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => {
              const isIncome = t.type === "income";
              return (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 rounded-2xl border-l-4 bg-card p-3 shadow-soft ${
                    isIncome ? "border-success" : "border-danger"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isIncome ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                  }`}>
                    {isIncome ? <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} /> : <ArrowDownRight className="h-5 w-5" strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{t.description || t.category}</p>
                      {classBadge(t.classification)}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.category} • {format(parseISO(t.date), "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className={`text-sm font-bold ${isIncome ? "text-success" : "text-danger"}`}>
                      {isIncome ? "+" : "−"} {formatCurrency(t.amount)}
                    </p>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => setEditing(t)}
                        aria-label="Editar"
                        className="rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Excluir esta transação?")) {
                            removeTransaction(t.id);
                            toast.success("Transação excluída");
                          }
                        }}
                        aria-label="Excluir"
                        className="rounded-md p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Dialog de edição (controlado, sem trigger) */}
      <AddTransactionDialog
        editing={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </MobileShell>
  );
};

export default Home;
