import { MobileShell } from "@/components/MobileShell";
import { useTransactions, useJourney, formatCurrency } from "@/hooks/useFinance";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Trophy, Sparkles } from "lucide-react";
import { JOURNEY_DAYS } from "@/data/journey";

const COLORS = [
  "hsl(162 73% 38%)",
  "hsl(38 95% 58%)",
  "hsl(200 80% 50%)",
  "hsl(280 60% 55%)",
  "hsl(0 75% 60%)",
  "hsl(140 50% 45%)",
  "hsl(25 85% 55%)",
  "hsl(220 70% 55%)",
  "hsl(320 55% 55%)",
];

// Cores semânticas para psicologia financeira
const COLOR_INCOME = "hsl(152 70% 42%)"; // verde — abundância, entrada
const COLOR_EXPENSE = "hsl(0 75% 58%)";  // vermelho — alerta, saída
const COLOR_BALANCE = "hsl(217 91% 55%)"; // azul — confiança, saldo

const Reports = () => {
  const { transactions, totals } = useTransactions();
  const { progress } = useJourney();

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Série diária com entradas, saídas e saldo acumulado
  const dailySeries = useMemo(() => {
    if (transactions.length === 0) return [];
    const byDate = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const cur = byDate.get(t.date) ?? { income: 0, expense: 0 };
      if (t.type === "income") cur.income += t.amount;
      else cur.expense += t.amount;
      byDate.set(t.date, cur);
    }
    let acc = 0;
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => {
        acc += d.income - d.expense;
        return {
          date,
          label: format(parseISO(date), "dd/MM"),
          income: d.income,
          expense: d.expense,
          balance: acc,
        };
      });
  }, [transactions]);

  // Health score 0-100 baseado em poupança vs entradas
  const healthScore = useMemo(() => {
    if (totals.income === 0) return 0;
    const ratio = (totals.income - totals.expense) / totals.income;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [totals]);

  // Mentor + mensagem do capítulo atual da jornada
  const mentor = useMemo(() => {
    const dayIndex = Math.min(progress, JOURNEY_DAYS.length - 1);
    const day = JOURNEY_DAYS[Math.max(0, dayIndex)];
    // Tutores por temática (referência ao sumário do ebook)
    const tutors = [
      { name: "Gustavo Cerbasi", role: "Orçamento Consciente", emoji: "📘" },
      { name: "Nathalia Arcuri", role: "Me Poupe!", emoji: "💰" },
      { name: "Thiago Nigro", role: "Do Mil ao Milhão", emoji: "📈" },
      { name: "Robert Kiyosaki", role: "Pai Rico, Pai Pobre", emoji: "🏛️" },
    ];
    const tutor = tutors[dayIndex % tutors.length];

    let message = day.description;
    let cta = `Dia ${day.day}: ${day.mission}`;

    if (healthScore >= 70) {
      message = `Excelente! Você está poupando ${healthScore}% das suas entradas. Como diz ${tutor.name}: invista a folga antes que ela vire desejo.`;
      cta = "Continue firme — meta de 21 dias em andamento";
    } else if (healthScore >= 30) {
      message = `Você está no caminho. ${tutor.name} ensina: o que se mede, se melhora. Reduza 1 supérfluo esta semana e veja o saldo crescer.`;
    } else if (totals.income > 0) {
      message = `Atenção! Suas saídas estão consumindo quase tudo que entra. ${tutor.name} alerta: liberdade financeira começa quando você gasta menos do que ganha.`;
      cta = "Revise seus gastos supérfluos hoje";
    } else {
      message = `${day.description}`;
    }

    return { tutor, message, cta, day };
  }, [progress, healthScore, totals.income]);

  const FlowTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const inc = payload.find((p: any) => p.dataKey === "income")?.value ?? 0;
    const exp = payload.find((p: any) => p.dataKey === "expense")?.value ?? 0;
    const bal = payload[0]?.payload?.balance ?? 0;
    return (
      <div className="rounded-xl border bg-popover/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg">
        <div className="mb-1.5 font-semibold text-foreground">{label}</div>
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR_INCOME }} />Entradas:</span>
          <span className="font-semibold" style={{ color: COLOR_INCOME }}>{formatCurrency(inc)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR_EXPENSE }} />Saídas:</span>
          <span className="font-semibold" style={{ color: COLOR_EXPENSE }}>{formatCurrency(exp)}</span>
        </div>
        <div className="mt-1 flex justify-between gap-4 border-t pt-1">
          <span className="text-muted-foreground">Saldo:</span>
          <span className="font-semibold" style={{ color: bal >= 0 ? COLOR_INCOME : COLOR_EXPENSE }}>
            {formatCurrency(bal)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visualize seus hábitos financeiros.</p>
      </header>

      {/* Resumo Entradas / Saídas / Saldo — psicologia das cores */}
      <section className="mb-5 grid grid-cols-3 gap-2">
        <div
          className="rounded-2xl p-3 shadow-soft"
          style={{ background: `linear-gradient(135deg, ${COLOR_INCOME}22, ${COLOR_INCOME}08)`, border: `1px solid ${COLOR_INCOME}33` }}
        >
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: COLOR_INCOME }}>
            <ArrowUpCircle className="h-3 w-3" /> Entradas
          </div>
          <div className="mt-1 text-sm font-bold" style={{ color: COLOR_INCOME }}>
            {formatCurrency(totals.income)}
          </div>
        </div>
        <div
          className="rounded-2xl p-3 shadow-soft"
          style={{ background: `linear-gradient(135deg, ${COLOR_EXPENSE}22, ${COLOR_EXPENSE}08)`, border: `1px solid ${COLOR_EXPENSE}33` }}
        >
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: COLOR_EXPENSE }}>
            <ArrowDownCircle className="h-3 w-3" /> Saídas
          </div>
          <div className="mt-1 text-sm font-bold" style={{ color: COLOR_EXPENSE }}>
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div
          className="rounded-2xl p-3 shadow-soft"
          style={{
            background: `linear-gradient(135deg, ${totals.balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE}22, transparent)`,
            border: `1px solid ${totals.balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE}33`,
          }}
        >
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Saldo
          </div>
          <div
            className="mt-1 text-sm font-bold"
            style={{ color: totals.balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE }}
          >
            {formatCurrency(totals.balance)}
          </div>
        </div>
      </section>

      {/* Card Gamificado — Mentor + Health Score */}
      <section
        className="mb-5 rounded-3xl p-5 shadow-soft"
        style={{
          background: `linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.02))`,
          border: `1px solid hsl(var(--primary) / 0.25)`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl">
            {mentor.tutor.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{mentor.tutor.name}</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                {mentor.tutor.role}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{mentor.message}</p>
          </div>
        </div>

        {/* Barra de progresso gamificada */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Trophy className="h-3 w-3 text-primary" /> Saúde Financeira
            </span>
            <span className="font-bold text-primary">{healthScore}/100</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${healthScore}%`,
                background: `linear-gradient(90deg, ${COLOR_EXPENSE}, ${COLOR_INCOME})`,
              }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" /> {mentor.cta}
          </p>
        </div>
      </section>

      {/* Gastos por categoria */}
      <section className="rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-base font-semibold">Gastos por categoria</h2>
        {byCategory.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sem dados de gastos ainda.</p>
        ) : (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5">
              {byCategory.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {c.name}
                  </span>
                  <span className="font-semibold">{formatCurrency(c.value)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Fluxo de caixa diário — barras evidentes */}
      <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
        <header className="mb-1">
          <h2 className="text-base font-semibold">Fluxo diário: entradas vs saídas</h2>
          <p className="text-xs text-muted-foreground">
            Compare visualmente o que entra (verde) e o que sai (vermelho) a cada dia.
          </p>
        </header>
        {dailySeries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <>
            <div className="mt-3 h-64 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySeries} margin={{ top: 12, right: 8, bottom: 0, left: 4 }} barCategoryGap="20%">
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) =>
                      Math.abs(v) >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`
                    }
                  />
                  <Tooltip content={<FlowTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                    formatter={(value) => (value === "income" ? "Entradas" : "Saídas")}
                  />
                  <Bar dataKey="income" fill={COLOR_INCOME} radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" fill={COLOR_EXPENSE} radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mini resumo da evolução do saldo */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Saldo acumulado</div>
                <div
                  className="text-base font-bold"
                  style={{
                    color: dailySeries[dailySeries.length - 1].balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE,
                  }}
                >
                  {formatCurrency(dailySeries[dailySeries.length - 1].balance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Dias registrados</div>
                <div className="text-base font-bold text-foreground">{dailySeries.length}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </MobileShell>
  );
};

export default Reports;
