import { MobileShell } from "@/components/MobileShell";
import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
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
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    let acc = 0;
    const map = new Map<string, number>();
    for (const t of sorted) {
      acc += t.type === "income" ? t.amount : -t.amount;
      map.set(t.date, acc);
    }
    return Array.from(map.entries()).map(([date, balance]) => ({
      date,
      label: format(parseISO(date), "dd/MM"),
      balance,
    }));
  }, [transactions]);

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
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ color: "hsl(var(--foreground))" }} />
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
