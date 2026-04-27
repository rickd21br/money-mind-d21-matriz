import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, TransactionType } from "@/types";
import { useTransactions } from "@/hooks/useFinance";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({ trigger }: Props) {
  const { addTransaction } = useTransactions();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reset = () => {
    setType("expense");
    setAmount("");
    setCategory(CATEGORIES[0]);
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    addTransaction({ type, amount: value, category, description: description.trim(), date });
    toast.success(type === "income" ? "Entrada registrada!" : "Saída registrada!");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="lg"
            className="fixed bottom-24 right-1/2 z-30 h-16 w-16 translate-x-[calc(50%+150px)] rounded-full gradient-primary p-0 shadow-floating hover:opacity-90"
            aria-label="Adicionar transação"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-smooth",
                type === "income" ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground"
              )}
            >
              <ArrowDownCircle className="h-6 w-6" />
              <span className="text-sm font-medium">Entrada</span>
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-smooth",
                type === "expense" ? "border-danger bg-danger/10 text-danger" : "border-border text-muted-foreground"
              )}
            >
              <ArrowUpCircle className="h-6 w-6" />
              <span className="text-sm font-medium">Saída</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 rounded-xl text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Ex.: Almoço, supermercado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <Button type="submit" size="lg" className="h-12 w-full rounded-xl gradient-primary text-base font-semibold">
            Salvar transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
