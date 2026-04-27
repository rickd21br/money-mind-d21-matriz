import { MobileShell } from "@/components/MobileShell";
import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

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

const Reports = () => {
  const { transactions } = useTransactions();

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const balanceSeries = useMemo(() => {
    if (transactions.length === 0) return [];
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    // Agrupa por data
    const byDate = new Map<string, { income: number; expense: number; count: number }>();
    for (const t of sorted) {
      const cur = byDate.get(t.date) ?? { income: 0, expense: 0, count: 0 };
      if (t.type === "income") cur.income += t.amount;
      else cur.expense += t.amount;
      cur.count += 1;
      byDate.set(t.date, cur);
    }

    let acc = 0;
    const series = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => {
        acc += d.income - d.expense;
        return {
          date,
          label: format(parseISO(date), "dd/MM"),
          balance: acc,
          income: d.income,
          expense: d.expense,
          count: d.count,
        };
      });

    // Garante ponto inicial e final quando há apenas uma data
    if (series.length === 1) {
      const only = series[0];
      return [
        { date: only.date, label: only.label, balance: 0, income: 0, expense: 0, count: 0 },
        only,
      ];
    }
    return series;
  }, [transactions]);

  const yDomain = useMemo<[number | string, number | string]>(() => {
    if (balanceSeries.length === 0) return [0, 0];
    const vals = balanceSeries.map((s) => s.balance);
    const min = Math.min(0, ...vals);
    const max = Math.max(0, ...vals);
    const pad = Math.max((max - min) * 0.1, 1);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [balanceSeries]);

  const BalanceTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as {
      label: string; balance: number; income: number; expense: number; count: number;
    };
    return (
      <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-md">
        <div className="mb-1 font-semibold text-foreground">{p.label}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Saldo:</span>
          <span className="font-semibold text-foreground">{formatCurrency(p.balance)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Entradas:</span>
          <span className="text-foreground">{formatCurrency(p.income)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Saídas:</span>
          <span className="text-foreground">{formatCurrency(p.expense)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Lançamentos:</span>
          <span className="text-foreground">{p.count}</span>
        </div>
      </div>
    );
  };

  return (
    <MobileShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visualize seus hábitos financeiros.</p>
      </header>

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

      <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-base font-semibold">Evolução do saldo</h2>
        {balanceSeries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  domain={yDomain}
                  tickFormatter={(v: number) =>
                    Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
                  }
                />
                <Tooltip content={<BalanceTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: 3 }} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </MobileShell>
  );
};

export default Reports;
