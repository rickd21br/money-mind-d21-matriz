import { useEffect, useRef, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Wallet,
  BarChart3,
  Lock,
  KeyRound,
  Instagram,
} from "lucide-react";
import { useUser } from "@/hooks/useFinance";
import { usePWAUpdate } from "@/hooks/usePWAUpdate";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoD21 from "@/assets/logo-d21.png";
import desafio21 from "@/assets/desafio-21-dias.png";
import googleLogo from "@/assets/google-logo.png";
import appleLogo from "@/assets/apple-logo.png";

const BG_URL = "https://jornadadoprogresso.com/wp-content/uploads/2026/04/onboarding-bg.png";
const TUTORIAL_SEEN_KEY = "d21.tutorialSeen";
const APP_VERSION = "6.5.26BR";
const SHOWCASE_AUDIO = "/sounds/transicao-botoes-login.mp3";
const SHOWCASE_LABELS = ["Ajuda", "Atualizações", "Instalar app"] as const;

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
  const currency = "BRL";
  const [installPrompt, setInstallPrompt] = useState<BIPEvent | null>(null);
  const { checking, checkForUpdate, applyUpdate, needRefresh } = usePWAUpdate();

  // Tutorial popup
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Showcase dos 3 botões superiores (Ajuda, Atualizações, Instalar app)
  // -1 = inativo; 0..2 = botão em destaque
  const [showcaseIdx, setShowcaseIdx] = useState<number>(-1);
  const showcaseAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Apresentação automática dos 3 botões a cada abertura do app
  useEffect(() => {
    let cancelled = false;
    const start = setTimeout(() => {
      if (cancelled) return;
      setShowcaseIdx(0);
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  useEffect(() => {
    if (showcaseIdx < 0) return;
    try {
      if (!showcaseAudioRef.current) {
        showcaseAudioRef.current = new Audio(SHOWCASE_AUDIO);
        showcaseAudioRef.current.volume = 0.6;
      }
      showcaseAudioRef.current.currentTime = 0;
      void showcaseAudioRef.current.play().catch(() => {});
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      setShowcaseIdx((i) => (i >= SHOWCASE_LABELS.length - 1 ? -1 : i + 1));
    }, 2500);
    return () => clearTimeout(t);
  }, [showcaseIdx]);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("App instalado!");
        setInstallPrompt(null);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      toast.info(
        isIOS
          ? "No iPhone: toque em Compartilhar → Adicionar à Tela de Início."
          : "Use o menu do navegador → Instalar app / Adicionar à tela inicial.",
        { duration: 5000 }
      );
    }
  };

  const handleUpdate = async () => {
    if (needRefresh) {
      toast.success("Atualizando o app…");
      await applyUpdate();
      return;
    }
    toast.info("Procurando atualização…");
    const has = await checkForUpdate();
    if (has) {
      toast.success("Nova versão encontrada! Atualizando…");
      await applyUpdate();
    } else {
      toast.success("Você já está na versão mais recente.");
    }
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

      <div
        className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 sm:max-w-lg sm:px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 2.5rem)" }}
      >
        {/* HEADER (logo apenas) */}
        <header className="flex items-center gap-3">
          <img
            src={logoD21}
            alt="Desafio D21"
            className="h-14 w-14 shrink-0 rounded-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)] sm:h-16 sm:w-16"
          />
          <img
            src={desafio21}
            alt="Desafio 21 Dias - Disciplina hoje. Liberdade amanhã."
            className="h-auto w-full max-w-[260px] flex-1 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)] sm:max-w-[320px]"
          />
        </header>

        {/* HEADLINE removido — identidade visual ao lado da logomarca */}

        {/* ============ STEP: FORM ============ */}
        {step === "form" && (
          <>
            <form
              onSubmit={handleSubmit}
              className="relative mt-7 space-y-3.5 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-floating backdrop-blur-xl"
            >
              {/* Grupo de ações: ajuda, atualizar, instalar */}
              <div className="absolute -top-4 right-3 z-10 flex items-center gap-3.5">
                <button
                  type="button"
                  aria-label="Ajuda / tutorial"
                  title="Ajuda"
                  onClick={() => setTutorialOpen((v) => !v)}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${
                    showcaseIdx === 0
                      ? "scale-125 ring-2 ring-white/60 shadow-[0_0_18px_rgba(255,255,255,0.55),0_0_36px_rgba(255,255,255,0.25)]"
                      : ""
                  }`}
                >
                  {showcaseIdx === 0 && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tracking-wide text-white animate-fade-in [text-shadow:0_0_6px_rgba(255,255,255,0.9),0_0_14px_rgba(255,255,255,0.55),0_2px_4px_rgba(0,0,0,0.85)]">
                      Ajuda
                    </span>
                  )}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <path d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Atualizar app"
                  title={needRefresh ? "Nova versão disponível!" : "Verificar atualização"}
                  onClick={handleUpdate}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${
                    checking ? "opacity-70" : ""
                  } ${
                    showcaseIdx === 1
                      ? "scale-125 ring-2 ring-white/60 shadow-[0_0_18px_rgba(255,255,255,0.55),0_0_36px_rgba(255,255,255,0.25)]"
                      : ""
                  }`}
                >
                  {showcaseIdx === 1 && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tracking-wide text-white animate-fade-in [text-shadow:0_0_6px_rgba(255,255,255,0.9),0_0_14px_rgba(255,255,255,0.55),0_2px_4px_rgba(0,0,0,0.85)]">
                      Atualizações
                    </span>
                  )}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-[22px] w-[22px] ${checking ? "animate-spin" : ""}`}
                  >
                    <path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                  {needRefresh && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500 ring-2 ring-black/40 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Instalar app"
                  title="Instalar app"
                  onClick={handleInstall}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${
                    showcaseIdx === 2
                      ? "scale-125 ring-2 ring-white/60 shadow-[0_0_18px_rgba(255,255,255,0.55),0_0_36px_rgba(255,255,255,0.25)]"
                      : ""
                  }`}
                >
                  {showcaseIdx === 2 && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tracking-wide text-white animate-fade-in [text-shadow:0_0_6px_rgba(255,255,255,0.9),0_0_14px_rgba(255,255,255,0.55),0_2px_4px_rgba(0,0,0,0.85)]">
                      Instalar app
                    </span>
                  )}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <path d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                  </svg>
                </button>
              </div>

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

              {/* Login social (visual / fake) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toast.info("Em breve: login com Google")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/95 text-sm font-semibold text-foreground transition hover:bg-white"
                >
                  <img src={googleLogo} alt="" className="h-4 w-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Em breve: login com Apple")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  <img src={appleLogo} alt="" className="h-4 w-4 invert" />
                  Apple
                </button>
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
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-5 text-left text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-5 text-left text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="h-14 w-full rounded-xl border border-white/20 bg-white/95 px-5 text-left text-2xl tracking-[0.6em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="mt-4 flex items-end justify-between gap-3 text-[10px] text-white/60">
            <div className="leading-tight">
              <p>Criado por <span className="font-semibold text-white/80">Wanderson Richard</span></p>
              <a
                href="https://instagram.com/eu.rickbr"
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-white/70 hover:text-white"
              >
                <Instagram className="h-3 w-3" /> @eu.rickbr
              </a>
            </div>
            <span className="font-mono text-white/55">v{APP_VERSION}</span>
          </div>
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

            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-3">
                <div
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-background"
                  style={{
                    boxShadow:
                      "0 0 0 2px hsl(var(--primary)), 0 0 18px hsl(var(--primary) / 0.65), 0 0 36px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <video
                    src="https://jornadadoprogresso.com/wp-content/uploads/2026/05/intro-Mentor.mp4"
                    autoPlay
                    playsInline
                    controls={false}
                    className="absolute inset-0 h-full w-full scale-110 object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-foreground">Mentor do Progresso</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
                    Online
                  </div>
                </div>
              </div>
              <h2 className="mt-4 w-full text-center text-lg font-bold text-foreground">
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
