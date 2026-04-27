import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Monitor, X, Download } from "lucide-react";
import { useUser } from "@/hooks/useFinance";
import { useStorage } from "@/hooks/useStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BG_URL = "https://jornadadoprogresso.com/wp-content/uploads/2026/04/onboarding-bg.png";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [, setOnboarded] = useStorage<boolean>("d21.onboarded", false);
  const [name, setName] = useState(user.name === "Visitante" ? "" : user.name);
  const [email, setEmail] = useState(user.email || "");
  const [installPrompt, setInstallPrompt] = useState<BIPEvent | null>(null);
  const [showInstall, setShowInstall] = useState(true);

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
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    setUser({ name: name.trim(), email: email.trim() });
    setOnboarded(true);
    navigate("/", { replace: true });
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      {/* Dark overlay (bottom → top gradient) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />

      {/* Floating install card */}
      {showInstall && (
        <div className="absolute right-4 top-6 z-20 w-[180px] rounded-2xl border border-white/15 bg-black/40 p-3 backdrop-blur-md sm:right-6 sm:top-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              Instalar app
            </p>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setShowInstall(false)}
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

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            Transforme suas finanças em resultados reais
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            Confirme seus dados para personalizar sua experiência no app
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-white/90">
              Nome completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              autoComplete="name"
              className="h-12 rounded-xl border-white/20 bg-white/95 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/90">
              E-mail de compra
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail de compra"
              autoComplete="email"
              className="h-12 rounded-xl border-white/20 bg-white/95 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            className="h-13 w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90"
          >
            Entrar
          </Button>
        </form>

        {!showInstall && (
          <button
            type="button"
            onClick={() => setShowInstall(true)}
            className="mx-auto mt-4 flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> Instalar app
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
