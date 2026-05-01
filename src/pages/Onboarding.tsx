import { useEffect, useRef, useState, FormEvent } from "react";
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
  HelpCircle,
  Lock,
  KeyRound,
} from "lucide-react";
import { useUser } from "@/hooks/useFinance";
import { useStorage } from "@/hooks/useStorage";
import { setActiveEmail } from "@/hooks/useSession";
import {
  hasAnyPin,
  hasPinFor,
  getLastPinEmail,
  savePin,
  verifyPin,
  removePin,
  getUserDataByEmail,
} from "@/hooks/usePin";
import { CURRENCIES, getCurrencyOption } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BG_URL = "https://jornadadoprogresso.com/wp-content/uploads/2026/04/onboarding-bg.png";
const TUTORIAL_SEEN_KEY = "d21.tutorialSeen";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const getFirstName = (full: string) => full.trim().split(/\s+/)[0] ?? "";

type Step = "form" | "createPin" | "pinLogin";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [, setOnboarded] = useStorage<boolean>("d21.onboarded", false);
  const [, setFirstName] = useStorage<string>("d21.firstName", "");

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState(user.name === "Visitante" ? "" : user.name);
  const [email, setEmail] = useState(user.email || "");
  const [currency, setCurrency] = useState<string>("BRL");
  const [installPrompt, setInstallPrompt] = useState<BIPEvent | null>(null);
  const [installOpen, setInstallOpen] = useState(false);

  // Tutorial popup
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // PIN — criação
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  // PIN — login
  const [loginPin, setLoginPin] = useState("");
  const [loginPinEmail, setLoginPinEmail] = useState("");

  const pinExists = hasAnyPin();

  // Tutorial: abre sozinho 1x
  useEffect(() => {
    try {
      if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) {
        const t = setTimeout(() => setTutorialOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const closeTutorial = () => {
    setTutorialOpen(false);
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

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

  /** Persiste o usuário no localStorage e navega pra Home. */
  const completeLogin = (trimmedName: string, trimmedEmail: string, curr: string) => {
    const first = getFirstName(trimmedName);
    setActiveEmail(trimmedEmail);
    const ns = `u:${trimmedEmail.toLowerCase()}:`;
    try {
      localStorage.setItem(
        `${ns}d21.user`,
        JSON.stringify({ name: trimmedName, email: trimmedEmail })
      );
      localStorage.setItem(`${ns}d21.firstName`, JSON.stringify(first));
      localStorage.setItem(`${ns}d21.onboarded`, JSON.stringify(true));
      localStorage.setItem(`${ns}d21.currency`, JSON.stringify(curr));
      localStorage.setItem("nome_completo", trimmedName);
      localStorage.setItem("email_usuario", trimmedEmail);
      localStorage.setItem("primeiro_nome", first);
      localStorage.setItem("onboarding_completed", "true");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("d21:session-change"));
    setUser({ name: trimmedName, email: trimmedEmail });
    setFirstName(first);
    setOnboarded(true);
    navigate("/", { replace: true });
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
    setName(trimmedName);
    setEmail(trimmedEmail);
    // Se já existe PIN para este email, pula direto pra etapa de criar PIN
    // (substitui o anterior). Caso contrário, pede para criar.
    setStep("createPin");
  };

  const handleCreatePin = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      toast.error("O PIN deve ter exatamente 4 dígitos");
      return;
    }
    if (pin !== pinConfirm) {
      toast.error("Os PINs não coincidem");
      return;
    }
    savePin(email, pin);
    toast.success("PIN criado com sucesso! 🔒");
    completeLogin(name, email, currency);
  };

  const handleSkipPin = () => {
    completeLogin(name, email, currency);
  };

  // ---------- Login via PIN ----------
  const openPinLogin = () => {
    if (!pinExists) {
      toast.error("Nenhum PIN cadastrado", {
        description: "Conclua a validação de acesso primeiro para criar seu PIN.",
      });
      return;
    }
    setLoginPinEmail(getLastPinEmail());
    setLoginPin("");
    setStep("pinLogin");
  };

  const handlePinLogin = (e: FormEvent) => {
    e.preventDefault();
    const targetEmail = loginPinEmail.trim().toLowerCase();
    if (!targetEmail) {
      toast.error("Informe seu e-mail");
      return;
    }
    if (!hasPinFor(targetEmail)) {
      toast.error("Não há PIN cadastrado para este e-mail");
      return;
    }
    if (!verifyPin(targetEmail, loginPin)) {
      toast.error("PIN incorreto");
      return;
    }
    const data = getUserDataByEmail(targetEmail);
    if (!data) {
      toast.error("Dados do usuário não encontrados. Faça o cadastro novamente.");
      removePin(targetEmail);
      setStep("form");
      return;
    }
    // tenta recuperar moeda salva
    let curr = "BRL";
    try {
      const raw = localStorage.getItem(`u:${targetEmail}:d21.currency`);
      if (raw) curr = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    toast.success(`Bem-vindo de volta, ${getFirstName(data.name)}! 👋`);
    completeLogin(data.name, data.email, curr);
  };

  const handleResetPin = () => {
    // Volta pro form normal — depois de logar, pode criar novo PIN
    toast.info("Faça login com nome + e-mail para redefinir seu PIN.");
    setStep("form");
  };

  return (
    <div className="fixed inset-0 overflow-y-auto">
      {/* Background image */}
      <div
        aria-hidden
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />
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
            {step === "form" && "Confirme seus dados para personalizar sua experiência no app."}
            {step === "createPin" && "Crie um PIN de 4 dígitos para acessar mais rápido."}
            {step === "pinLogin" && "Digite seu PIN para entrar no app."}
          </p>
        </div>

        {/* ============ STEP: FORM ============ */}
        {step === "form" && (
          <>
            <form
              onSubmit={handleSubmit}
              className="relative mt-7 space-y-3.5 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-floating backdrop-blur-xl"
            >
              {/* Botão de ajuda */}
              <button
                type="button"
                aria-label="Ajuda"
                onClick={() => setTutorialOpen((v) => !v)}
                className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <HelpCircle className="h-5 w-5" />
              </button>

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
                  Selecione a moeda usada no seu país. Atual: {getCurrencyOption(currency).symbol}
                </p>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90"
              >
                Entrar
              </Button>

              <button
                type="button"
                onClick={openPinLogin}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition ${
                  pinExists
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                <Lock className="h-4 w-4" />
                Entrar com PIN seguro
              </button>
              {!pinExists && (
                <p className="text-center text-[10px] text-white/55">
                  Disponível após você concluir a validação de acesso e criar um PIN.
                </p>
              )}
            </form>
          </>
        )}

        {/* ============ STEP: CREATE PIN ============ */}
        {step === "createPin" && (
          <form
            onSubmit={handleCreatePin}
            className="mt-7 space-y-4 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-floating backdrop-blur-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/30 backdrop-blur">
                <KeyRound className="h-7 w-7 text-white" />
              </div>
              <p className="mt-3 text-base font-semibold text-white">Criar PIN de acesso</p>
              <p className="mt-1 text-xs text-white/70">
                Com o PIN você entra no app em segundos, sem digitar nome e e-mail toda vez.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/85">PIN (4 dígitos)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                autoFocus
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-4 text-center text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/85">Confirme o PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-4 text-center text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90"
            >
              Criar PIN e entrar
            </Button>

            <button
              type="button"
              onClick={handleSkipPin}
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/5 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Pular por agora
            </button>
            <p className="text-center text-[10px] text-white/55">
              Você pode criar ou alterar o PIN depois no Perfil.
            </p>
          </form>
        )}

        {/* ============ STEP: PIN LOGIN ============ */}
        {step === "pinLogin" && (
          <form
            onSubmit={handlePinLogin}
            className="mt-7 space-y-4 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-floating backdrop-blur-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/30 backdrop-blur">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <p className="mt-3 text-base font-semibold text-white">Entrar com PIN</p>
              <p className="mt-1 text-xs text-white/70">Digite seu PIN de 4 dígitos.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/85">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={loginPinEmail}
                  onChange={(e) => setLoginPinEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/95 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/85">PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                autoFocus
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-4 text-center text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90"
            >
              Entrar
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={handleResetPin}
                className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                Esqueci meu PIN
              </button>
            </div>
          </form>
        )}

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

      {/* ============ TUTORIAL POPUP ============ */}
      {tutorialOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fechar tutorial"
            onClick={closeTutorial}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-card p-6 shadow-floating animate-bounce-in">
            <button
              type="button"
              aria-label="Fechar"
              onClick={closeTutorial}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/70"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-3 text-lg font-bold text-foreground">
                Bem-vindo ao Money Mind 21D
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Para acessar o app, informe seu <strong>nome</strong> e o{" "}
                <strong>e-mail de compra</strong> nos campos abaixo e valide seu cadastro.
              </p>
            </div>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  1
                </span>
                <span className="text-foreground/85">
                  Preencha seu <strong>nome completo</strong> e <strong>e-mail de compra</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  2
                </span>
                <span className="text-foreground/85">
                  Selecione a <strong>moeda</strong> usada no seu país.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  3
                </span>
                <span className="text-foreground/85">
                  Crie um <strong>PIN de 4 dígitos</strong> para entrar mais rápido nas próximas
                  vezes.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  4
                </span>
                <span className="text-foreground/85">
                  Pronto! Acesse pelo botão <strong>Entrar</strong> ou pelo{" "}
                  <strong>PIN seguro</strong>.
                </span>
              </li>
            </ul>

            <Button
              onClick={closeTutorial}
              className="mt-6 h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              Entendi, vamos começar!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
