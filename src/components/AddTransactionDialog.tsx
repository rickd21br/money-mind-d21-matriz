import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownCircle, ArrowUpCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/types";
import { useTransactions, useCategories } from "@/hooks/useFinance";
import { toast } from "sonner";
import { InfoHint } from "./InfoHint";
import { getGroupInfo, getCategoryInfo } from "@/data/categoryInfo";

interface Props {
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({ trigger }: Props) {
  const { addTransaction } = useTransactions();
  const { getGroups, getCategories, addCategory } = useCategories();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [group, setGroup] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const groups = useMemo(() => getGroups(type), [getGroups, type]);
  const categories = useMemo(
    () => (group ? getCategories(type, group) : []),
    [getCategories, type, group]
  );

  // Reset group/category when type changes
  useEffect(() => {
    setGroup("");
    setCategory("");
    setCreatingCat(false);
  }, [type]);

  // Reset category when group changes
  useEffect(() => {
    setCategory("");
    setCreatingCat(false);
    setNewCatName("");
  }, [group]);

  const reset = () => {
    setType("expense");
    setGroup("");
    setCategory("");
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setCreatingCat(false);
    setNewCatName("");
  };

  const handleCreateCategory = () => {
    const name = newCatName.trim();
    if (!name) {
      toast.error("Informe um nome para a categoria");
      return;
    }
    if (!group) return;
    addCategory(type, group, name);
    setCategory(name);
    setCreatingCat(false);
    setNewCatName("");
    toast.success("Categoria criada!");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (!group) {
      toast.error("Escolha um grupo");
      return;
    }
    if (!category) {
      toast.error("Escolha uma categoria");
      return;
    }
    addTransaction({ type, amount: value, group, category, description: description.trim(), date });
    toast.success(type === "income" ? "Entrada registrada!" : "Saída registrada!");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
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
      <DialogContent className="max-w-sm rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Step 1: Type */}
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
            />
          </div>

          {/* Step 2: Group */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Grupo</Label>
              <InfoHint
                title="O que é um Grupo?"
                description="Grupo é a 'gaveta' grande onde você guarda tipos parecidos de gasto ou ganho. Ex.: 'Casa' reúne aluguel, energia, internet. Ajuda a enxergar para onde vai o seu dinheiro em blocos."
                example="Pense no grupo como o capítulo de um livro, e nas categorias como as páginas dele."
              />
              {group && getGroupInfo(type, group) && (
                <span className="ml-auto">
                  <InfoHint
                    title={group}
                    description={getGroupInfo(type, group) ?? ""}
                  />
                </span>
              )}
            </div>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Escolha um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => {
                  const info = getGroupInfo(type, g);
                  return (
                    <div key={g} className="flex items-center gap-1 pr-2">
                      <SelectItem value={g} className="flex-1 py-2.5">
                        <span className="text-sm font-medium">{g}</span>
                      </SelectItem>
                      {info && (
                        <InfoHint title={g} description={info} />
                      )}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Step 3: Category (filtered) */}
          {group && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label>Categoria</Label>
                  <InfoHint
                    title="O que é uma Categoria?"
                    description="Categoria é o detalhe específico dentro do grupo escolhido. Ex.: dentro de 'Casa', você tem 'Aluguel', 'Energia', 'Internet'. É o que aparece nos seus relatórios."
                    example="Quanto mais precisa a categoria, mais clareza você tem sobre seus hábitos."
                  />
                  {category && getCategoryInfo(type, category) && (
                    <InfoHint
                      title={category}
                      description={getCategoryInfo(type, category) ?? ""}
                    />
                  )}
                </div>
                {!creatingCat && (
                  <button
                    type="button"
                    onClick={() => setCreatingCat(true)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Nova categoria
                  </button>
                )}
              </div>

              {creatingCat ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da categoria"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-12 rounded-xl"
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    className="h-12 rounded-xl"
                  >
                    Criar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setCreatingCat(false); setNewCatName(""); }}
                    className="h-12 rounded-xl"
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Escolha uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => {
                      const info = getCategoryInfo(type, c);
                      return (
                        <SelectItem key={c} value={c} className="py-2.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{c}</span>
                            {info && (
                              <span className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                                {info}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

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
