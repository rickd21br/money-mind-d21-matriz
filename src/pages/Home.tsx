import { useTransactions, formatCurrency } from "@/hooks/useFinance";
import { MobileShell } from "@/components/MobileShell";
import { MentorCard } from "@/components/MentorCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { ArrowDownRight, ArrowUpRight, Wallet, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const Home = () => {
  const { transactions, totals } = useTransactions();
  const recent = transactions.slice(0, 6);
  const balancePositive = totals.balance >= 0;

  return (
    <MobileShell>
      {/* SALDO — neutro/calmo, transmite controle */}
      <section className="relative overflow-hidden rounded-3xl gradient-card p-6 text-primary-foreground shadow-elevated">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-2 text-xs font-medium opacity-90">
          <Wallet className="h-4 w-4" />
          <span>Saldo atual</span>
        </div>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatCurrency(totals.balance)}
        </p>
        <p className="mt-1 text-[11px] font-medium opacity-80">
          {balancePositive
            ? "Você está no controle. Continue assim."
            : "Atenção: o vermelho é um aviso, não uma sentença."}
        </p>

        {/* Cards de Entradas e Saídas com cores psicológicas claras */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* ENTRADAS — verde-vital, seta para cima */}
          <div className="rounded-2xl border-l-4 border-success bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-95">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/90">
                <ArrowUpRight className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              Entradas
            </div>
            <p className="mt-1.5 text-lg font-bold leading-tight">
              {formatCurrency(totals.income)}
            </p>
          </div>

          {/* SAÍDAS — vermelho-alerta, seta para baixo */}
          <div className="rounded-2xl border-l-4 border-danger bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-95">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/90">
                <ArrowDownRight className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              Saídas
            </div>
            <p className="mt-1.5 text-lg font-bold leading-tight">
              {formatCurrency(totals.expense)}
            </p>
          </div>
        </div>
      </section>

      {/* MENTOR + MENSAGEM DE IMPACTO */}
      <div className="mt-5">
        <MentorCard />
      </div>

      {/* GRÁFICO 7 DIAS */}
      <div className="mt-5">
        <WeeklyChart />
      </div>

      {/* TRANSAÇÕES RECENTES — agora com codificação por cor */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Receipt className="h-4 w-4 text-primary" />
            Transações recentes
          </h2>
          {recent.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {transactions.length} no total
            </span>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação ainda.
              <br />
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
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {t.description || t.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} •{" "}
                      {format(parseISO(t.date), "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      isIncome ? "text-success" : "text-danger"
                    }`}
                  >
                    {isIncome ? "+" : "−"} {formatCurrency(t.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </MobileShell>
  );
};

export default Home;
