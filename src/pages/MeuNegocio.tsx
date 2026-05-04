import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useStorage } from "@/hooks/useStorage";
import { Briefcase, Plus, Pencil, Trash2, Search, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type Supplier = { name: string; phone?: string; email?: string; address?: string };
type Product = {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  supplier?: Supplier;
};

type Recurrence = "unico" | "diario" | "semanal" | "mensal" | "bimestral" | "trimestral" | "anual" | "personalizado";
type Service = {
  id: string;
  name: string;
  type: "unico" | "recorrente";
  recurrence?: Recurrence;
  amount: number;
  startDate: string;
  receiveDate: string;
  status: "pendente" | "recebido";
  description?: string;
  image?: string;
};

type PaymentMethod = "Pix" | "Crédito" | "Débito" | "Boleto";
type SaleStatus = "Pago" | "Recusado" | "Aguardando" | "Reembolsado" | "Cancelado";
type Sale = {
  id: string;
  productId: string;
  customer: string;
  email?: string;
  phone?: string;
  cpf?: string;
  payment: PaymentMethod;
  status: SaleStatus;
  amount: number;
  date: string;
  refund?: boolean;
  chargeback?: boolean;
};
type Infoproduct = {
  id: string;
  name: string;
  platform: string;
  commissionType: "percent" | "fixed";
  commission: number;
  description?: string;
};

const FIXED_PLATFORMS = ["Hotmart", "Kiwify", "Cakto", "Ticto"];
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- File reader ----------
function readFile(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
}

// ---------- CSV parse ----------
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((ln) => {
    const cols = ln.split(/[,;]/);
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = (cols[i] || "").trim()));
    return o;
  });
}

// ============================================================
const MeuNegocio = () => {
  return (
    <MobileShell>
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">Gestão</p>
          <h1 className="text-lg font-bold">Meu Negócio</h1>
        </div>
      </header>

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="info">Infoprodutos</TabsTrigger>
        </TabsList>
        <TabsContent value="produtos" className="mt-4"><ProdutosTab /></TabsContent>
        <TabsContent value="servicos" className="mt-4"><ServicosTab /></TabsContent>
        <TabsContent value="info" className="mt-4"><InfoTab /></TabsContent>
      </Tabs>
    </MobileShell>
  );
};

// =================== PRODUTOS ===================
function ProdutosTab() {
  const [items, setItems] = useStorage<Product[]>("d21.mn.products", []);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))), [items]);
  const filtered = items.filter(
    (p) =>
      (cat === "todas" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  const save = (p: Product) => {
    setItems((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
    setOpen(false);
    setEditing(null);
    toast.success("Produto salvo");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-8" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild>
          <Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />Novo produto</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} produto</DialogTitle></DialogHeader>
          <ProductForm initial={editing} onSave={save} />
        </DialogContent>
      </Dialog>

      <ul className="space-y-2">
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum produto.</p>}
        {filtered.map((p) => {
          const margin = p.cost > 0 ? ((p.price - p.cost) / p.cost) * 100 : 0;
          return (
            <li key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Briefcase className="h-5 w-5" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.category} • Estoque: {p.stock}</p>
                <p className="text-xs">R$ {p.price.toFixed(2)} <span className={cn("ml-1 font-semibold", margin >= 0 ? "text-emerald-600" : "text-red-500")}>({margin.toFixed(0)}%)</span></p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => { setEditing(p); setOpen(true); }} className="rounded p-1 hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Excluir?")) { setItems(items.filter((x) => x.id !== p.id)); toast.success("Excluído"); } }} className="rounded p-1 hover:bg-red-500/10 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProductForm({ initial, onSave }: { initial: Product | null; onSave: (p: Product) => void }) {
  const [f, setF] = useState<Product>(
    initial ?? { id: uid(), name: "", category: "", cost: 0, price: 0, stock: 0, description: "", image: "", supplier: {} as Supplier }
  );
  const set = (k: keyof Product, v: any) => setF((p) => ({ ...p, [k]: v }));
  const setSup = (k: keyof Supplier, v: any) => setF((p) => ({ ...p, supplier: { ...(p.supplier || { name: "" }), [k]: v } }));

  return (
    <div className="space-y-3">
      <div><Label>Nome</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div><Label>Categoria</Label><Input value={f.category} onChange={(e) => set("category", e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div><Label>Custo</Label><Input type="number" value={f.cost} onChange={(e) => set("cost", +e.target.value)} /></div>
        <div><Label>Venda</Label><Input type="number" value={f.price} onChange={(e) => set("price", +e.target.value)} /></div>
        <div><Label>Estoque</Label><Input type="number" value={f.stock} onChange={(e) => set("stock", +e.target.value)} /></div>
      </div>
      <div><Label>Descrição</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Imagem</Label>
        <Input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("image", await readFile(file)); }} />
        {f.image && <img src={f.image} alt="" className="mt-2 h-20 w-20 rounded-lg object-cover" />}
      </div>
      <div className="rounded-xl border border-border p-3">
        <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Fornecedor</p>
        <div className="space-y-2">
          <Input placeholder="Nome" value={f.supplier?.name || ""} onChange={(e) => setSup("name", e.target.value)} />
          <Input placeholder="Telefone" value={f.supplier?.phone || ""} onChange={(e) => setSup("phone", e.target.value)} />
          <Input placeholder="Email" value={f.supplier?.email || ""} onChange={(e) => setSup("email", e.target.value)} />
          <Input placeholder="Endereço" value={f.supplier?.address || ""} onChange={(e) => setSup("address", e.target.value)} />
        </div>
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => f.name && onSave(f)}>Salvar</Button>
    </div>
  );
}

// =================== SERVIÇOS ===================
function ServicosTab() {
  const [items, setItems] = useStorage<Service[]>("d21.mn.services", []);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const save = (s: Service) => {
    setItems((prev) => prev.find((x) => x.id === s.id) ? prev.map((x) => x.id === s.id ? s : x) : [s, ...prev]);
    setOpen(false); setEditing(null);
    toast.success("Serviço salvo");
  };
  const toggle = (s: Service) => setItems(items.map((x) => x.id === s.id ? { ...x, status: x.status === "recebido" ? "pendente" : "recebido" } : x));

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />Novo serviço</Button></DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} serviço</DialogTitle></DialogHeader>
          <ServiceForm initial={editing} onSave={save} />
        </DialogContent>
      </Dialog>
      <ul className="space-y-2">
        {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum serviço.</p>}
        {items.map((s) => (
          <li key={s.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
            {s.image ? <img src={s.image} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-blue-500/10" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.type === "recorrente" ? `Recorrente • ${s.recurrence}` : "Único"}</p>
              <p className="text-xs">R$ {s.amount.toFixed(2)} • {s.receiveDate}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button onClick={() => toggle(s)} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", s.status === "recebido" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600")}>{s.status}</button>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setOpen(true); }} className="rounded p-1 hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Excluir?")) setItems(items.filter((x) => x.id !== s.id)); }} className="rounded p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceForm({ initial, onSave }: { initial: Service | null; onSave: (s: Service) => void }) {
  const [f, setF] = useState<Service>(
    initial ?? { id: uid(), name: "", type: "unico", amount: 0, startDate: "", receiveDate: "", status: "pendente", description: "", image: "" }
  );
  const set = (k: keyof Service, v: any) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3">
      <div><Label>Nome</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Tipo</Label>
          <Select value={f.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unico">Único</SelectItem>
              <SelectItem value="recorrente">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Valor</Label><Input type="number" value={f.amount} onChange={(e) => set("amount", +e.target.value)} /></div>
      </div>
      {f.type === "recorrente" && (
        <div><Label>Periodicidade</Label>
          <Select value={f.recurrence || "mensal"} onValueChange={(v) => set("recurrence", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["diario","semanal","mensal","bimestral","trimestral","anual","personalizado"].map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Início</Label><Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
        <div><Label>Recebimento</Label><Input type="date" value={f.receiveDate} onChange={(e) => set("receiveDate", e.target.value)} /></div>
      </div>
      <div><Label>Descrição</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Imagem</Label>
        <Input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("image", await readFile(file)); }} />
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => f.name && onSave(f)}>Salvar</Button>
    </div>
  );
}

// =================== INFOPRODUTOS ===================
function InfoTab() {
  const [extraPlatforms, setExtraPlatforms] = useStorage<string[]>("d21.mn.platforms", []);
  const [products, setProducts] = useStorage<Infoproduct[]>("d21.mn.infoproducts", []);
  const [sales, setSales] = useStorage<Sale[]>("d21.mn.sales", []);
  const [view, setView] = useState<"plataformas" | "produtos" | "vendas">("produtos");

  const platforms = [...FIXED_PLATFORMS, ...extraPlatforms];
  const addPlatform = () => {
    const n = prompt("Nome da plataforma");
    if (n && n.trim()) setExtraPlatforms([...extraPlatforms, n.trim()]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["produtos","vendas","plataformas"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={cn("flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold capitalize", view === v ? "bg-background shadow" : "text-muted-foreground")}>{v}</button>
        ))}
      </div>

      {view === "plataformas" && (
        <div className="space-y-2">
          <Button onClick={addPlatform} className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />Adicionar plataforma</Button>
          <ul className="space-y-1">
            {platforms.map((p) => {
              const fixed = FIXED_PLATFORMS.includes(p);
              return (
                <li key={p} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <span className="text-sm font-semibold">{p}</span>
                  {fixed ? <span className="text-[10px] uppercase text-muted-foreground">Fixa</span> : (
                    <div className="flex gap-1">
                      <button onClick={() => { const n = prompt("Editar", p); if (n && n.trim()) setExtraPlatforms(extraPlatforms.map((x) => x === p ? n.trim() : x)); }} className="rounded p-1 hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setExtraPlatforms(extraPlatforms.filter((x) => x !== p))} className="rounded p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {view === "produtos" && <InfoProductsView products={products} setProducts={setProducts} platforms={platforms} />}
      {view === "vendas" && <SalesView sales={sales} setSales={setSales} products={products} />}
    </div>
  );
}

function InfoProductsView({ products, setProducts, platforms }: { products: Infoproduct[]; setProducts: (v: Infoproduct[] | ((p: Infoproduct[]) => Infoproduct[])) => void; platforms: string[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Infoproduct | null>(null);
  const save = (p: Infoproduct) => {
    setProducts((prev) => prev.find((x) => x.id === p.id) ? prev.map((x) => x.id === p.id ? p : x) : [p, ...prev]);
    setOpen(false); setEditing(null); toast.success("Salvo");
  };
  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />Novo infoproduto</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} infoproduto</DialogTitle></DialogHeader>
          <InfoForm initial={editing} platforms={platforms} onSave={save} />
        </DialogContent>
      </Dialog>
      <ul className="space-y-2">
        {products.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum infoproduto.</p>}
        {products.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.platform} • {p.commissionType === "percent" ? `${p.commission}%` : `R$ ${p.commission.toFixed(2)}`}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setOpen(true); }} className="rounded p-1 hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Excluir?")) setProducts(products.filter((x) => x.id !== p.id)); }} className="rounded p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoForm({ initial, platforms, onSave }: { initial: Infoproduct | null; platforms: string[]; onSave: (p: Infoproduct) => void }) {
  const [f, setF] = useState<Infoproduct>(initial ?? { id: uid(), name: "", platform: platforms[0], commissionType: "percent", commission: 0, description: "" });
  const set = (k: keyof Infoproduct, v: any) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3">
      <div><Label>Nome</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div><Label>Plataforma</Label>
        <Select value={f.platform} onValueChange={(v) => set("platform", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{platforms.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Tipo</Label>
          <Select value={f.commissionType} onValueChange={(v) => set("commissionType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">R$</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Comissão</Label><Input type="number" value={f.commission} onChange={(e) => set("commission", +e.target.value)} /></div>
      </div>
      <div><Label>Descrição</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => f.name && onSave(f)}>Salvar</Button>
    </div>
  );
}

function SalesView({ sales, setSales, products }: { sales: Sale[]; setSales: (v: Sale[] | ((p: Sale[]) => Sale[])) => void; products: Infoproduct[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [filters, setFilters] = useState({ name: "", email: "", cpf: "", from: "", to: "", payment: "todos", status: "todos" });

  const filtered = sales.filter((s) => {
    if (filters.name && !s.customer.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.email && !(s.email || "").toLowerCase().includes(filters.email.toLowerCase())) return false;
    if (filters.cpf && !(s.cpf || "").includes(filters.cpf)) return false;
    if (filters.from && s.date < filters.from) return false;
    if (filters.to && s.date > filters.to) return false;
    if (filters.payment !== "todos" && s.payment !== filters.payment) return false;
    if (filters.status !== "todos" && s.status !== filters.status) return false;
    return true;
  });

  const save = (s: Sale) => {
    setSales((prev) => prev.find((x) => x.id === s.id) ? prev.map((x) => x.id === s.id ? s : x) : [s, ...prev]);
    setOpen(false); setEditing(null); toast.success("Venda salva");
  };

  const importFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) { toast.error("Use arquivo CSV (XLS pode ser exportado como CSV)"); return; }
    const text = await file.text();
    const rows = parseCSV(text);
    let added = 0;
    const newSales: Sale[] = rows.map((r) => {
      const status = (r["status"] || "Pago") as SaleStatus;
      const payment = (r["pagamento"] || r["forma"] || "Pix") as PaymentMethod;
      const sale: Sale = {
        id: uid(),
        productId: r["produto"] || "",
        customer: r["cliente"] || r["nome"] || "",
        email: r["email"],
        phone: r["telefone"],
        cpf: r["cpf"],
        payment,
        status,
        amount: parseFloat((r["valor"] || "0").replace(",", ".")) || 0,
        date: r["data"] || new Date().toISOString().slice(0, 10),
      };
      if (sale.customer) added++;
      return sale;
    }).filter((s) => s.customer);
    setSales((prev) => [...newSales, ...prev]);
    toast.success(`${added} vendas importadas`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button className="flex-1 bg-blue-600 hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />Venda</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} venda</DialogTitle></DialogHeader>
            <SaleForm initial={editing} products={products} onSave={save} />
          </DialogContent>
        </Dialog>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-3 text-xs font-semibold">
          <Upload className="h-3.5 w-3.5" />Importar
          <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        </label>
      </div>

      <details className="rounded-xl border border-border bg-card p-3">
        <summary className="cursor-pointer text-xs font-bold uppercase">Filtros</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input placeholder="Nome" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <Input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          <Input placeholder="CPF" value={filters.cpf} onChange={(e) => setFilters({ ...filters, cpf: e.target.value })} />
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <Select value={filters.payment} onValueChange={(v) => setFilters({ ...filters, payment: v })}>
            <SelectTrigger><SelectValue placeholder="Pagamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos pgto</SelectItem>
              {["Pix","Crédito","Débito","Boleto"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              {["Pago","Recusado","Aguardando","Reembolsado","Cancelado"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </details>

      <ul className="space-y-2">
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma venda.</p>}
        {filtered.map((s) => (
          <li key={s.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{s.customer}</p>
                <p className="text-xs text-muted-foreground">{s.payment} • {s.date} • R$ {s.amount.toFixed(2)}</p>
                {s.email && <p className="truncate text-[10px] text-muted-foreground">{s.email}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  s.status === "Pago" ? "bg-emerald-500/15 text-emerald-600" :
                  s.status === "Aguardando" ? "bg-amber-500/15 text-amber-600" :
                  "bg-red-500/15 text-red-600"
                )}>{s.status}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(s); setOpen(true); }} className="rounded p-1 hover:bg-primary/10"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => { if (confirm("Excluir?")) setSales(sales.filter((x) => x.id !== s.id)); }} className="rounded p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaleForm({ initial, products, onSave }: { initial: Sale | null; products: Infoproduct[]; onSave: (s: Sale) => void }) {
  const [f, setF] = useState<Sale>(initial ?? {
    id: uid(), productId: products[0]?.id || "", customer: "", email: "", phone: "", cpf: "",
    payment: "Pix", status: "Pago", amount: 0, date: new Date().toISOString().slice(0, 10),
    refund: false, chargeback: false,
  });
  const set = (k: keyof Sale, v: any) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3">
      <div><Label>Produto</Label>
        <Select value={f.productId} onValueChange={(v) => set("productId", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{products.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div><Label>Cliente</Label><Input value={f.customer} onChange={(e) => set("customer", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Email</Label><Input value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><Label>Telefone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>CPF</Label><Input value={f.cpf} onChange={(e) => set("cpf", e.target.value)} /></div>
        <div><Label>Valor</Label><Input type="number" value={f.amount} onChange={(e) => set("amount", +e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Pagamento</Label>
          <Select value={f.payment} onValueChange={(v) => set("payment", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Pix","Crédito","Débito","Boleto"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><Label>Status</Label>
          <Select value={f.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Pago","Recusado","Aguardando","Reembolsado","Cancelado"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Data</Label><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.refund} onChange={(e) => set("refund", e.target.checked)} />Reembolso</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.chargeback} onChange={(e) => set("chargeback", e.target.checked)} />Chargeback</label>
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => f.customer && onSave(f)}>Salvar</Button>
    </div>
  );
}

export default MeuNegocio;
