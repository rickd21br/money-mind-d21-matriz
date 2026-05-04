import { MobileShell } from "@/components/MobileShell";
import { ExternalLink, Store } from "lucide-react";

const PRODUCTS = [
  {
    title: "Desafio 21 Dias — Jornada do Progresso",
    description: "Transforme sua relação com o dinheiro em 21 dias.",
    url: "https://kiwify.app/AaBECZ6?afid=4UF5JUi5",
  },
  {
    title: "Método Sociedade Viral",
    description: "Estratégias para crescer e viralizar no digital.",
    url: "https://kiwify.app/fCHyZSL?afid=xPHPNStm",
  },
];

const Vitrine = () => {
  return (
    <MobileShell>
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Vitrine</p>
          <h1 className="text-lg font-bold">Vitrine de Infoprodutos</h1>
        </div>
      </header>

      <ul className="space-y-4">
        {PRODUCTS.map((p) => (
          <li
            key={p.url}
            className="overflow-hidden rounded-3xl border border-red-500/20 bg-card p-5 shadow-floating"
          >
            <h2 className="text-base font-bold leading-snug">{p.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            >
              Acessar oferta <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </MobileShell>
  );
};

export default Vitrine;
