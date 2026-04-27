import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { MobileShell } from "@/components/MobileShell";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const Home = () => {
  const { transactions, totals } = useTransactions();

  const recent = transactions.slice(0, 8);

  return (
    <MobileShell>
      <section className="relative overflow-hidden rounded-3xl gradient-card p-6 text-primary-foreground shadow-elevated">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-medium opacity-80">Saldo atual</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatCurrency(totals.balance)}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs opacity-90">
              <ArrowDownCircle className="h-4 w-4" /> Entradas
            </div>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(totals.income)}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs opacity-90">
              <ArrowUpCircle className="h-4 w-4" /> Saídas
            </div>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(totals.expense)}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transações recentes</h2>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação ainda.<br />Toque no <span className="font-semibold text-primary">+</span> para começar.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    t.type === "income" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                  }`}
                >
                  {t.type === "income" ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} • {format(parseISO(t.date), "dd MMM", { locale: ptBR })}
                  </p>
                </div>
                <p className={`text-sm font-bold ${t.type === "income" ? "text-success" : "text-foreground"}`}>
                  {t.type === "income" ? "+" : "−"} {formatCurrency(t.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

    </MobileShell>
  );
};


export default Home;
