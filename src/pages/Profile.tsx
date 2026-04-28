import { MobileShell } from "@/components/MobileShell";
import { useUser, useJourney, useTransactions } from "@/hooks/useFinance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import { endSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { CurrencySelect } from "@/components/CurrencySelect";

const Profile = () => {
  const { user, setUser } = useUser();
  const { progress } = useJourney();
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const handleLogout = () => {
    endSession();
    window.dispatchEvent(new Event("d21:session-change"));
    toast.success("Sessão encerrada", {
      description: "Seus dados ficam salvos. Entre novamente para acessá-los.",
    });
    navigate("/bem-vindo", { replace: true });
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
