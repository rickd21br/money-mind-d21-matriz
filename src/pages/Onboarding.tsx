import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Monitor,
  X,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Wallet,
  BarChart3,
  Sparkles,
  Globe,
} from "lucide-react";
import { useUser } from "@/hooks/useFinance";
import { useStorage } from "@/hooks/useStorage";
import { setActiveEmail } from "@/hooks/useSession";
import { CURRENCIES, getCurrencyOption } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BG_URL = "https://jornadadoprogresso.com/wp-content/uploads/2026/04/onboarding-bg.png";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const getFirstName = (full: string) => full.trim().split(/\s+/)[0] ?? "";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [, setOnboarded] = useStorage<boolean>("d21.onboarded", false);
  const [, setFirstName] = useStorage<string>("d21.firstName", "");
  const [name, setName] = useState(user.name === "Visitante" ? "" : user.name);
  const [email, setEmail] = useState(user.email || "");
  const [currency, setCurrency] = useState<string>("BRL");
  const [installPrompt, setInstallPrompt] = useState<BIPEvent | null>(null);
  const [installOpen, setInstallOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async (target: "mobile" | "desktop") => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("App instalado!");
        setInstallPrompt(null);
      }
    } else {
      toast.info(
        target === "mobile"
          ? "No celular: toque em Compartilhar → Adicionar à tela inicial."
          : "No desktop: clique no ícone de instalar na barra de endereço."
      );
    }
    setInstallOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      toast.error("Informe seu nome completo");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Informe um e-mail válido");
      return;
    }
    const first = getFirstName(trimmedName);
    // 1) Ativa sessão deste usuário ANTES de qualquer escrita escopada
    setActiveEmail(trimmedEmail);
    // 2) Grava DIRETO no localStorage usando o namespace do usuário,
    //    evitando race conditions com useStorage/setState.
    const ns = `u:${trimmedEmail.toLowerCase()}:`;
    try {
      localStorage.setItem(
        `${ns}d21.user`,
        JSON.stringify({ name: trimmedName, email: trimmedEmail })
      );
      localStorage.setItem(`${ns}d21.firstName`, JSON.stringify(first));
      localStorage.setItem(`${ns}d21.onboarded`, JSON.stringify(true));
      localStorage.setItem(`${ns}d21.currency`, JSON.stringify(currency));
      // chaves globais legadas
      localStorage.setItem("nome_completo", trimmedName);
      localStorage.setItem("email_usuario", trimmedEmail);
      localStorage.setItem("primeiro_nome", first);
      localStorage.setItem("onboarding_completed", "true");
    } catch {
      /* ignore */
    }
    // 3) Notifica hooks já montados a relerem do novo namespace
    window.dispatchEvent(new Event("d21:session-change"));
    // 4) Atualiza estado React (caso instâncias estejam vivas)
    setUser({ name: trimmedName, email: trimmedEmail });
    setFirstName(first);
    setOnboarded(true);
    navigate("/", { replace: true });
  };

  return (
    <div className="fixed inset-0 overflow-y-auto">
      {/* Background image */}
      <div
        aria-hidden
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />
      {/* Overlay for readability */}
      <div
        aria-hidden
        className="fixed inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/85"
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 pt-5 sm:max-w-lg sm:px-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-elevated">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">D21 App</p>
              <p className="text-[10px] uppercase tracking-wide text-white/70">
                Finanças Controladas V1.1
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setInstallOpen((v) => !v)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Instalar App
            </button>

            {installOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[180px] rounded-2xl border border-white/15 bg-black/60 p-3 shadow-floating backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
                    Instalar
                  </p>
                  <button
                    type="button"
                    aria-label="Fechar"
                    onClick={() => setInstallOpen(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstall("mobile")}
                  className="mb-1.5 flex w-full items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/20"
                >
                  <Smartphone className="h-3.5 w-3.5" /> No celular
                </button>
                <button
                  type="button"
                  onClick={() => handleInstall("desktop")}
                  className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/20"
                >
                  <Monitor className="h-3.5 w-3.5" /> No desktop
                </button>
              </div>
            )}
          </div>
        </header>

        {/* HEADLINE */}
        <div className="mt-10">
          <h1 className="text-left text-[24px] font-bold leading-tight text-white sm:text-4xl">
            Transforme suas finanças em{" "}
            <span style={{ color: "hsl(var(--primary-glow))" }}>resultados reais.</span>
          </h1>
          <p className="mt-3 max-w-sm text-left text-sm text-white/75 sm:text-base">
            Confirme seus dados para personalizar sua experiência no app.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-3.5 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-floating backdrop-blur-xl"
        >
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-white/85">
              Nome completo
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                autoComplete="name"
                maxLength={100}
                className="h-12 w-full rounded-xl border border-white/20 bg-white/95 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-white/85">
              E-mail de compra
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail de compra"
                autoComplete="email"
                maxLength={255}
                className="h-12 w-full rounded-xl border border-white/20 bg-white/95 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="currency" className="text-xs font-medium text-white/85">
              Moeda principal
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-white/20 bg-white/95 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.label} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-white/60">
              Você pode mudar depois no Perfil. Atual: {getCurrencyOption(currency).symbol}
            </p>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90"
          >
            Entrar
          </Button>
        </form>

        {/* FOOTER */}
        <footer className="mt-auto pt-8">
          <ul className="grid grid-cols-3 gap-2 text-center">
            <li className="flex flex-col items-center gap-1.5">
              <Wallet className="h-4 w-4 text-white/85" />
              <span className="text-[10px] leading-tight text-white/75">
                Controle total das suas finanças
              </span>
            </li>
            <li className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-white/85" />
              <span className="text-[10px] leading-tight text-white/75">
                Segurança e privacidade
              </span>
            </li>
            <li className="flex flex-col items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-white/85" />
              <span className="text-[10px] leading-tight text-white/75">
                Relatórios claros e objetivos
              </span>
            </li>
          </ul>
        </footer>
      </div>
    </div>
  );
};

export default Onboarding;
