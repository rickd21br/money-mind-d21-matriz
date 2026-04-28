import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownCircle, ArrowUpCircle, PlusCircle, Pencil, Trash2, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Classification, Transaction, TransactionType } from "@/types";
import { useTransactions, useCategories } from "@/hooks/useFinance";
import { toast } from "sonner";
import { InfoHint } from "./InfoHint";
import { getGroupInfo, getCategoryInfo } from "@/data/categoryInfo";
import { ClassificationPicker } from "./ClassificationPicker";
import { CurrencyInput } from "./CurrencyInput";
import { parseMaskedToNumber, formatNumberInput, useCurrency } from "@/hooks/useCurrency";

interface Props {
  trigger?: React.ReactNode;
  /** Quando definido, abre em modo edição. */
  editing?: Transaction | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({ trigger, editing, open: controlledOpen, onOpenChange }: Props) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { getGroups, getCategories, addCategory, isCustomCategory, removeCategory, renameCategory } = useCategories();
  const { code: currencyCode } = useCurrency();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (o: boolean) => {
    onOpenChange?.(o);
    if (controlledOpen === undefined) setInternalOpen(o);
  };

  const [type, setType] = useState<TransactionType>("expense");
  const [group, setGroup] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [classification, setClassification] = useState<Classification | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingCatValue, setEditingCatValue] = useState("");

  const isEditing = !!editing;

  // Hidrata em modo edição quando o dialog abre.
  useEffect(() => {
    if (editing && open) {
      setType(editing.type);
      setGroup(editing.group ?? "");
      setCategory(editing.category);
      setClassification(editing.classification);
      setAmount(formatNumberInput(editing.amount, currencyCode));
      setDescription(editing.description);
      setDate(editing.date);
    }
  }, [editing, open, currencyCode]);

  const groups = useMemo(() => getGroups(type), [getGroups, type]);
  const categories = useMemo(
    () => (group ? getCategories(type, group) : []),
    [getCategories, type, group]
  );

  // Reset group/category when type changes (apenas em modo criação)
  useEffect(() => {
    if (isEditing) return;
    setGroup("");
    setCategory("");
    setCreatingCat(false);
  }, [type, isEditing]);

  useEffect(() => {
    if (isEditing) return;
    setCategory("");
    setCreatingCat(false);
    setNewCatName("");
  }, [group, isEditing]);

  const reset = () => {
    setType("expense");
    setGroup("");
    setCategory("");
    setClassification(undefined);
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setCreatingCat(false);
    setNewCatName("");
    setEditingCatName(null);
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

  const handleRenameCategory = (oldName: string) => {
    const newName = editingCatValue.trim();
    if (!newName || newName === oldName) {
      setEditingCatName(null);
      return;
    }
    renameCategory(type, group, oldName, newName);
    if (category === oldName) setCategory(newName);
    setEditingCatName(null);
    setEditingCatValue("");
    toast.success("Categoria renomeada");
  };

  const handleRemoveCategory = (name: string) => {
    removeCategory(type, group, name);
    if (category === name) setCategory("");
    toast.success("Categoria removida");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseMaskedToNumber(amount);
    if (!value || value <= 0) { toast.error("Informe um valor válido"); return; }
    if (!group) { toast.error("Escolha um grupo"); return; }
    if (!category) { toast.error("Escolha uma categoria"); return; }
    if (!classification) { toast.error("Classifique como Essencial, Supérfluo ou Meta"); return; }

    const payload = { type, amount: value, group, category, description: description.trim(), date, classification };
    if (isEditing && editing) {
      updateTransaction(editing.id, payload);
      toast.success("Transação atualizada");
    } else {
      addTransaction(payload);
      toast.success(type === "income" ? "Entrada registrada!" : "Saída registrada!");
    }
    reset();
    setOpen(false);
  };

  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      {!isControlled && (
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
      )}
      <DialogContent className="max-w-sm rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEditing ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Step 1: Type */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => !isEditing && setType("income")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-smooth",
                type === "income" ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground",
                isEditing && type !== "income" && "opacity-40"
              )}
            >
              <ArrowDownCircle className="h-6 w-6" />
              <span className="text-sm font-medium">Entrada</span>
            </button>
            <button
              type="button"
              onClick={() => !isEditing && setType("expense")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-smooth",
                type === "expense" ? "border-danger bg-danger/10 text-danger" : "border-border text-muted-foreground",
                isEditing && type !== "expense" && "opacity-40"
              )}
            >
              <ArrowUpCircle className="h-6 w-6" />
              <span className="text-sm font-medium">Saída</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Valor</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
            />
          </div>

          {/* Step 2: Group */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Grupo</Label>
              <InfoHint
                title="O que é um Grupo?"
                description="Grupo é a 'gaveta' grande onde você guarda tipos parecidos de gasto ou ganho. Ex.: 'Casa' reúne aluguel, energia, internet."
                example="Pense no grupo como o capítulo de um livro, e nas categorias como as páginas dele."
              />
              {group && getGroupInfo(type, group) && (
                <span className="ml-auto">
                  <InfoHint title={group} description={getGroupInfo(type, group) ?? ""} />
                </span>
              )}
            </div>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Escolha um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g} value={g} className="py-2.5">
                    <span className="text-sm font-medium">{g}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 3: Category */}
          {group && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label>Categoria</Label>
                  <InfoHint
                    title="O que é uma Categoria?"
                    description="Categoria é o detalhe dentro do grupo. É o que aparece nos seus relatórios."
                  />
                  {category && getCategoryInfo(type, category) && (
                    <InfoHint title={category} description={getCategoryInfo(type, category) ?? ""} />
                  )}
                </div>
                {!creatingCat && (
                  <button
                    type="button"
                    onClick={() => setCreatingCat(true)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Nova categoria
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
                  <Button type="button" onClick={handleCreateCategory} className="h-12 rounded-xl">Criar</Button>
                  <Button type="button" variant="outline" onClick={() => { setCreatingCat(false); setNewCatName(""); }} className="h-12 rounded-xl">×</Button>
                </div>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Escolha uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => {
                      const isCustom = isCustomCategory(type, group, c);
                      const isRenaming = editingCatName === c;
                      if (isRenaming) {
                        return (
                          <div key={c} className="flex items-center gap-1 px-2 py-1.5">
                            <Input
                              value={editingCatValue}
                              onChange={(e) => setEditingCatValue(e.target.value)}
                              className="h-8 rounded-md"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleRenameCategory(c); }
                                if (e.key === "Escape") { e.preventDefault(); setEditingCatName(null); }
                              }}
                            />
                            <button type="button" onClick={() => handleRenameCategory(c)} className="rounded-md p-1.5 text-success hover:bg-success/10">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setEditingCatName(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                              <XIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div key={c} className="flex items-center gap-0.5 pr-1">
                          <SelectItem value={c} className="flex-1 py-2.5">
                            <span className="text-sm font-medium">{c}</span>
                          </SelectItem>
                          {isCustom && (
                            <>
                              <button
                                type="button"
                                aria-label="Renomear categoria"
                                onClick={(e) => { e.stopPropagation(); setEditingCatName(c); setEditingCatValue(c); }}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Excluir categoria"
                                onClick={(e) => { e.stopPropagation(); handleRemoveCategory(c); }}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Classificação E/S/M — sempre visível, compacto */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Classificação</Label>
            </div>
            <ClassificationPicker value={classification} onChange={setClassification} />
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
            {isEditing ? "Salvar alterações" : "Salvar transação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
