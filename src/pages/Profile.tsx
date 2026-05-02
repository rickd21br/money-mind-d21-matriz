import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useUser, useJourney, useTransactions } from "@/hooks/useFinance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Globe, KeyRound, Trash2, Database, Download, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { endSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { CurrencySelect } from "@/components/CurrencySelect";
import { hasPinFor, savePin, removePin } from "@/hooks/usePin";
import { exportData, importDataPicker } from "@/lib/dataBackup";
import { usePWAUpdate } from "@/hooks/usePWAUpdate";

const Profile = () => {
  const { user, setUser } = useUser();
  const { progress } = useJourney();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const { needRefresh, checking, checkForUpdate, applyUpdate } = usePWAUpdate();

  const pinExists = hasPinFor(user.email);
  const [showPinForm, setShowPinForm] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const handleCheckUpdate = async () => {
    if (needRefresh) {
      toast.success("Atualizando o app…");
      await applyUpdate();
      return;
    }
    toast.info("Procurando atualização…");
    await checkForUpdate();
    setTimeout(async () => {
      if (needRefresh) await applyUpdate();
      else toast.success("Você já está na versão mais recente.");
    }, 1800);
  };

  const handleLogout = () => {
    endSession();
    window.dispatchEvent(new Event("d21:session-change"));
    toast.success("Sessão encerrada", {
      description: "Seus dados ficam salvos. Entre novamente para acessá-los.",
    });
    navigate("/bem-vindo", { replace: true });
  };

  const handleSavePin = () => {
    if (!user.email) {
      toast.error("Faça login antes de criar um PIN");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      toast.error("O PIN deve ter exatamente 4 dígitos");
      return;
    }
    if (pin !== pinConfirm) {
      toast.error("Os PINs não coincidem");
      return;
    }
    savePin(user.email, pin);
    setPin("");
    setPinConfirm("");
    setShowPinForm(false);
    toast.success(pinExists ? "PIN atualizado! 🔒" : "PIN criado! 🔒");
  };

  const handleRemovePin = () => {
    removePin(user.email);
    setShowPinForm(false);
    toast.success("PIN removido");
  };

  return (
    <MobileShell>
      <section className="flex flex-col items-center rounded-3xl gradient-card p-6 text-primary-foreground shadow-elevated">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <UserIcon className="h-10 w-10" />
        </div>
        <p className="mt-3 text-lg font-bold">{user.name || "Visitante"}</p>
        <p className="text-sm opacity-90">{user.email || "sem email"}</p>

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur">
            <p className="text-xs opacity-80">Dias concluídos</p>
            <p className="text-xl font-bold">{progress}/21</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 text-center backdrop-blur">
            <p className="text-xs opacity-80">Transações</p>
            <p className="text-xl font-bold">{transactions.length}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder="Seu nome"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="seu@email.com"
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" /> Moeda
          </Label>
          <CurrencySelect />
          <p className="text-[10px] text-muted-foreground">
            Aplica-se a todos os valores, gráficos e relatórios do app.
          </p>
        </div>
      </section>

      {/* PIN de acesso rápido */}
      <section className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">PIN de acesso rápido</p>
              <p className="text-xs text-muted-foreground">
                {pinExists
                  ? "PIN ativo — entre no app sem digitar e-mail."
                  : "Crie um PIN de 4 dígitos para entrar mais rápido."}
              </p>
            </div>
          </div>
          {pinExists && (
            <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              Ativo
            </span>
          )}
        </div>

        {!showPinForm ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => setShowPinForm(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {pinExists ? "Alterar PIN" : "Criar PIN"}
            </Button>
            {pinExists && (
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                onClick={handleRemovePin}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remover PIN
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="pin">Novo PIN (4 dígitos)</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="h-12 rounded-xl text-center text-xl tracking-[0.5em]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pin-confirm">Confirme o PIN</Label>
              <Input
                id="pin-confirm"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="h-12 rounded-xl text-center text-xl tracking-[0.5em]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => {
                  setShowPinForm(false);
                  setPin("");
                  setPinConfirm("");
                }}
              >
                Cancelar
              </Button>
              <Button className="h-11 flex-1 rounded-xl" onClick={handleSavePin}>
                Salvar PIN
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Backup de dados (exportar / importar) */}
      <section className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Backup dos lançamentos</p>
            <p className="text-xs text-muted-foreground">
              Exporte seus dados para usar em outro dispositivo ou navegador.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() => {
              exportData();
              toast.success("Backup exportado!", { description: "Arquivo .json salvo no seu dispositivo." });
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar dados
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() => importDataPicker("merge")}
          >
            <Upload className="mr-2 h-4 w-4" /> Importar dados
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Importar mescla os lançamentos do arquivo aos atuais. Após importar, o app recarrega automaticamente.
        </p>
      </section>

      {/* Atualização do app */}
      <section className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <RefreshCw className={`h-5 w-5 text-primary ${checking ? "animate-spin" : ""}`} />
            {needRefresh && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Atualização do app</p>
            <p className="text-xs text-muted-foreground">
              {needRefresh
                ? "Nova versão disponível! Toque para atualizar."
                : "Verifique se há uma versão nova do Money Mind 21D."}
            </p>
          </div>
        </div>
        <Button
          className="h-11 w-full rounded-xl"
          onClick={handleCheckUpdate}
          disabled={checking}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
          {needRefresh ? "Atualizar agora" : checking ? "Verificando…" : "Verificar atualização"}
        </Button>
      </section>

      <Button
        onClick={handleLogout}
        variant="outline"
        size="lg"
        className="mt-6 h-12 w-full rounded-2xl border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        D21 — Jornada do Progresso · v1.0
      </p>
    </MobileShell>
  );
};

export default Profile;
