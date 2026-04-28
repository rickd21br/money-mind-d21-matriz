import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency, parseMaskedToNumber } from "@/hooks/useCurrency";
import { Calculator as CalcIcon, TrendingUp, Shield, Flame, Receipt } from "lucide-react";

function Result({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-primary/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------- Juros Compostos ----------
function CompoundTab() {
  const { format } = useCurrency();
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("1");
  const [months, setMonths] = useState("60");

  const result = useMemo(() => {
    const P = parseMaskedToNumber(initial);
    const PMT = parseMaskedToNumber(monthly);
    const i = (parseFloat(rate) || 0) / 100;
    const n = parseInt(months) || 0;
    const fvP = P * Math.pow(1 + i, n);
    const fvPMT = i > 0 ? PMT * ((Math.pow(1 + i, n) - 1) / i) : PMT * n;
    const total = fvP + fvPMT;
    const invested = P + PMT * n;
    return { total, invested, profit: total - invested };
  }, [initial, monthly, rate, months]);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Investimento inicial</Label>
        <CurrencyInput value={initial} onChange={setInitial} />
      </div>
      <div>
        <Label className="text-xs">Aporte mensal</Label>
        <CurrencyInput value={monthly} onChange={setMonthly} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Taxa mensal (%)</Label>
          <Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs">Período (meses)</Label>
          <Input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className="h-12 rounded-xl" />
        </div>
      </div>
      <Result label="Patrimônio final" value={format(result.total)} hint={`Investido: ${format(result.invested)} • Juros: ${format(result.profit)}`} />
    </div>
  );
}

// ---------- Reserva de Emergência ----------
function EmergencyTab() {
  const { format } = useCurrency();
  const [expenses, setExpenses] = useState("");
  const [months, setMonths] = useState("6");
  const [save, setSave] = useState("");

  const target = parseMaskedToNumber(expenses) * (parseInt(months) || 0);
  const monthlySave = parseMaskedToNumber(save);
  const monthsToReach = monthlySave > 0 ? Math.ceil(target / monthlySave) : 0;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Despesas mensais essenciais</Label>
        <CurrencyInput value={expenses} onChange={setExpenses} />
      </div>
      <div>
        <Label className="text-xs">Meses de proteção (ideal: 6)</Label>
        <Input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className="h-12 rounded-xl" />
      </div>
      <div>
        <Label className="text-xs">Quanto consigo guardar por mês</Label>
        <CurrencyInput value={save} onChange={setSave} />
      </div>
      <Result label="Reserva ideal" value={format(target)} hint={monthsToReach > 0 ? `Você chega lá em ~${monthsToReach} meses` : undefined} />
    </div>
  );
}

// ---------- FIRE / Independência Financeira ----------
function FireTab() {
  const { format } = useCurrency();
  const [needed, setNeeded] = useState("");
  const [rate, setRate] = useState("0.5");

  const m = parseMaskedToNumber(needed);
  const i = (parseFloat(rate) || 0) / 100;
  const target = i > 0 ? m / i : 0;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Renda mensal desejada</Label>
        <CurrencyInput value={needed} onChange={setNeeded} />
      </div>
      <div>
        <Label className="text-xs">Rendimento mensal real (%)</Label>
        <Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="h-12 rounded-xl" />
      </div>
      <Result
        label="Patrimônio para liberdade"
        value={format(target)}
        hint="Esse é o valor que, rendendo a taxa informada, paga sua renda mensal sem ser consumido."
      />
    </div>
  );
}

// ---------- Financiamento (Price + SAC) ----------
function LoanTab() {
  const { format } = useCurrency();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("1");
  const [months, setMonths] = useState("60");

  const result = useMemo(() => {
    const PV = parseMaskedToNumber(amount);
    const i = (parseFloat(rate) || 0) / 100;
    const n = parseInt(months) || 0;
    if (!PV || !n) return null;

    // PRICE: parcela fixa
    const pricePmt = i > 0 ? (PV * i) / (1 - Math.pow(1 + i, -n)) : PV / n;
    const priceTotal = pricePmt * n;

    // SAC: amortização constante
    const amort = PV / n;
    const sacFirst = amort + PV * i;
    const sacLast = amort + amort * i; // última parcela
    const sacTotal = (sacFirst + sacLast) / 2 * n;

    return { pricePmt, priceTotal, sacFirst, sacLast, sacTotal, juros: priceTotal - PV, jurosSac: sacTotal - PV };
  }, [amount, rate, months]);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Valor financiado</Label>
        <CurrencyInput value={amount} onChange={setAmount} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Taxa mensal (%)</Label>
          <Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs">Parcelas</Label>
          <Input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className="h-12 rounded-xl" />
        </div>
      </div>
      {result && (
        <>
          <Result label="PRICE — parcela fixa" value={format(result.pricePmt)} hint={`Total pago: ${format(result.priceTotal)} • Juros: ${format(result.juros)}`} />
          <Result label="SAC — 1ª / última parcela" value={`${format(result.sacFirst)} → ${format(result.sacLast)}`} hint={`Total: ${format(result.sacTotal)} • Juros: ${format(result.jurosSac)}`} />
        </>
      )}
    </div>
  );
}

const Calculator = () => {
  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <CalcIcon className="h-6 w-6 text-primary" /> Calculadora
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ferramentas para decisões financeiras conscientes.
        </p>
      </header>

      <Tabs defaultValue="compound" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl">
          <TabsTrigger value="compound" className="rounded-xl"><TrendingUp className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="emergency" className="rounded-xl"><Shield className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="fire" className="rounded-xl"><Flame className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="loan" className="rounded-xl"><Receipt className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        <TabsContent value="compound" className="mt-5"><CompoundTab /></TabsContent>
        <TabsContent value="emergency" className="mt-5"><EmergencyTab /></TabsContent>
        <TabsContent value="fire" className="mt-5"><FireTab /></TabsContent>
        <TabsContent value="loan" className="mt-5"><LoanTab /></TabsContent>
      </Tabs>
    </MobileShell>
  );
};

export default Calculator;
