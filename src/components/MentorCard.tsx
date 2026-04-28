import { useMemo } from "react";
import { useTransactions, useJourney } from "@/hooks/useFinance";
import { JOURNEY_DAYS } from "@/data/journey";
import { Sparkles, BookOpen, ArrowRight, Trophy, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Mentor por capítulo. Quando o usuário ainda não iniciou, mostra Cerbasi (Cap. 1).
 * Quando avança, troca o tutor de acordo com o último capítulo concluído.
 */
const MENTORS: Record<number, { name: string; role: string; initials: string; tone: string }> = {
  1: { name: "Gustavo Cerbasi", role: "Orçamento Consciente", initials: "GC", tone: "from-emerald-500 to-teal-600" },
  2: { name: "Dave Ramsey", role: "Bola de Neve das Dívidas", initials: "DR", tone: "from-amber-500 to-orange-600" },
  3: { name: "Robert Kiyosaki", role: "Ativos x Passivos", initials: "RK", tone: "from-violet-500 to-fuchsia-600" },
  4: { name: "Nathália Arcuri", role: "Me Poupe na prática", initials: "NA", tone: "from-pink-500 to-rose-600" },
  5: { name: "Thiago Nigro", role: "Investidor Inteligente", initials: "TN", tone: "from-sky-500 to-indigo-600" },
};

const getMentor = (day: number) => MENTORS[day] ?? MENTORS[1];

/** Mensagens de impacto por etapa — gatilhos emocionais alinhados ao sumário. */
function pickMessage(opts: {
  daysDone: number;
  txCount: number;
  balance: number;
  expense: number;
  income: number;
  hasRecentTx: boolean;
}) {
  const { daysDone, txCount, balance, expense, income, hasRecentTx } = opts;

  if (txCount === 0) {
    return {
      tag: "Comece agora",
      title: "Você não controla o que não enxerga.",
      body: "Registre sua primeira entrada ou saída. Em 30 segundos você muda a relação com o seu dinheiro.",
      cta: "Iniciar Dia 1",
    };
  }

  if (daysDone === 0 && txCount > 0) {
    return {
      tag: "Próximo passo",
      title: "Bom começo. Agora vire o jogo.",
      body: "Abra o Dia 1 da Jornada e classifique seus gastos em Essencial, Supérfluo ou Meta — o filtro do Cerbasi.",
      cta: "Abrir Jornada",
    };
  }

  if (expense > income && income > 0) {
    return {
      tag: "Sinal vermelho",
      title: "Está saindo mais do que entra.",
      body: "Esse é o ponto exato em que a maioria desiste. Você não. Identifique 1 supérfluo hoje e corte amanhã.",
      cta: "Ver gastos",
    };
  }

  if (balance > 0 && daysDone >= 1) {
    return {
      tag: `+${daysDone} ${daysDone === 1 ? "dia" : "dias"} de evolução`,
      title: "Saldo positivo é resultado de escolha, não de sorte.",
      body: "Continue o ritmo. Cada lançamento registrado é um tijolo no seu novo padrão financeiro.",
      cta: "Continuar jornada",
    };
  }

  if (!hasRecentTx) {
    return {
      tag: "Não perca o ritmo",
      title: "Hábito quebrado custa caro.",
      body: "Faltou anotar hoje? Volte agora — 30 segundos preservam 21 dias de constância.",
      cta: "Registrar agora",
    };
  }

  return {
    tag: "Mantenha o foco",
    title: "Disciplina é liberdade adiada.",
    body: "Você está construindo o tipo de pessoa que decide o próprio futuro. Não pare por aqui.",
    cta: "Continuar",
  };
}

export function MentorCard() {
  const navigate = useNavigate();
  const { transactions, totals } = useTransactions();
  const { progress, completed } = useJourney();

  const lastDay = completed.length > 0 ? Math.max(...completed) : 1;
  const currentDay = Math.min(lastDay + (progress > 0 ? 1 : 0), 21);
  const mentor = getMentor(currentDay);
  const dayMeta = JOURNEY_DAYS[currentDay - 1];

  const hasRecentTx = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    return transactions.some((t) => Date.now() - new Date(t.createdAt).getTime() < dayMs);
  }, [transactions]);

  const msg = pickMessage({
    daysDone: progress,
    txCount: transactions.length,
    balance: totals.balance,
    expense: totals.expense,
    income: totals.income,
    hasRecentTx,
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft">
      {/* Glow decorativo */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${mentor.tone} opacity-20 blur-3xl`}
      />

      {/* Header mentor */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${mentor.tone} text-sm font-bold text-white shadow-elevated`}
        >
          {mentor.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">{mentor.name}</p>
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <BookOpen className="h-3 w-3" /> Cap. {currentDay} • {mentor.role}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {progress >= 7 ? <Trophy className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
          {progress}/21
        </div>
      </div>

      {/* Tag */}
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
        <Sparkles className="h-3 w-3" />
        {msg.tag}
      </div>

      {/* Mensagem de impacto */}
      <h3 className="mt-2 text-base font-bold leading-snug text-foreground">{msg.title}</h3>
      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{msg.body}</p>

      {/* CTA */}
      <button
        onClick={() => navigate("/jornada")}
        className="mt-4 flex w-full items-center justify-between rounded-2xl gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-elevated transition-smooth active:scale-[0.98]"
      >
        <span>{msg.cta}</span>
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* Dica relacionada ao capítulo */}
      {dayMeta && (
        <p className="mt-3 border-t border-border pt-3 text-[11px] italic leading-snug text-muted-foreground">
          “{dayMeta.title}” — {dayMeta.mission}.
        </p>
      )}
    </section>
  );
}
