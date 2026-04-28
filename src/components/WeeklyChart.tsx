import { useMemo } from "react";
import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { TrendingUp } from "lucide-react";

const DAYS = 7;

/**
 * Mini gráfico de barras dos últimos 7 dias.
 * Cores psicológicas:
 *  - Entradas (income): verde-success (crescimento, vitalidade)
 *  - Saídas  (expense): vermelho-danger (alerta, atenção)
 */
export function WeeklyChart() {
  const { transactions } = useTransactions();

  const buckets = useMemo(() => {
    const now = new Date();
    const out: { label: string; income: number; expense: number; isToday: boolean }[] = [];

    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      const dayTx = transactions.filter((t) => {
        const td = new Date(t.date);
        td.setHours(0, 0, 0, 0);
        return td.toISOString().slice(0, 10) === key;
      });

      out.push({
        label: ["D", "S", "T", "Q", "Q", "S", "S"][d.getDay()],
        income: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        isToday: i === 0,
      });
    }
    return out;
  }, [transactions]);

  const max = Math.max(1, ...buckets.flatMap((b) => [b.income, b.expense]));
  const totalIn = buckets.reduce((s, b) => s + b.income, 0);
  const totalOut = buckets.reduce((s, b) => s + b.expense, 0);
  const net = totalIn - totalOut;
  const hasData = totalIn + totalOut > 0;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Últimos 7 dias
          </p>
          <h3 className="mt-0.5 flex items-center gap-1.5 text-base font-bold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Sua evolução
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Saldo da semana
          </p>
          <p
            className={`text-base font-bold ${
              net >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {net >= 0 ? "+" : "−"} {formatCurrency(Math.abs(net))}
          </p>
        </div>
      </header>

      {/* Gráfico */}
      <div className="flex h-28 items-end justify-between gap-1.5">
        {buckets.map((b, idx) => {
          const inPct = (b.income / max) * 100;
          const outPct = (b.expense / max) * 100;
          return (
            <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex h-full w-full items-end justify-center gap-0.5">
                <div
                  className="w-1/2 rounded-t-md bg-success/85 transition-all"
                  style={{ height: `${Math.max(inPct, b.income > 0 ? 4 : 0)}%` }}
                  title={`Entradas: ${formatCurrency(b.income)}`}
                />
                <div
                  className="w-1/2 rounded-t-md bg-danger/85 transition-all"
                  style={{ height: `${Math.max(outPct, b.expense > 0 ? 4 : 0)}%` }}
                  title={`Saídas: ${formatCurrency(b.expense)}`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  b.isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-5 text-[11px]">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-success" />
          Entradas
        </span>
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-danger" />
          Saídas
        </span>
      </div>

      {!hasData && (
        <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
          Sem lançamentos nos últimos 7 dias — comece agora para ver sua curva.
        </p>
      )}
    </section>
  );
}
