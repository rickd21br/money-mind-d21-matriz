import { Bell, Menu, Home, Target, Plus, BarChart3, User as UserIcon, Sun, Moon, Settings, LogOut } from "lucide-react";
import { useUser, useJourney } from "@/hooks/useFinance";
import { useTheme } from "@/hooks/useTheme";
import { useStorage } from "@/hooks/useStorage";
import { endSession } from "@/hooks/useSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { user } = useUser();
  const { progress } = useJourney();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useStorage<boolean>("d21.notifications", false);
  const navigate = useNavigate();

  const initials =
    (user.name || "V")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const abbreviateName = (full: string) => {
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 2) return full;
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
    return `${first} ${middle} ${last}`;
  };
  const displayName = user.name && user.name.length > 22 ? abbreviateName(user.name) : user.name;

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    toast.success(next ? "Notificações ativadas" : "Notificações desativadas");
  };

  return (
    <header
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl"
      style={{ paddingTop: "max(env(safe-area-inset-top), 2.25rem)" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-5 pt-2">
        {/* Notifications */}
        <button
          type="button"
          onClick={toggleNotifications}
          aria-label="Ativar notificações"
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft transition-smooth hover:bg-secondary",
            notifications && "text-primary"
          )}
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          {notifications && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />
          )}
        </button>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft transition-smooth hover:bg-secondary"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuLabel>Navegação</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" /> Início
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/jornada")}>
              <Target className="mr-2 h-4 w-4" /> Jornada
            </DropdownMenuItem>
            <AddTransactionDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem onClick={() => navigate("/relatorios")}>
              <BarChart3 className="mr-2 h-4 w-4" /> Relatórios
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/perfil")}>
              <UserIcon className="mr-2 h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Configurações</DropdownMenuLabel>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
              {theme === "dark" ? (
                <><Sun className="mr-2 h-4 w-4" /> Modo claro</>
              ) : (
                <><Moon className="mr-2 h-4 w-4" /> Modo escuro</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleNotifications}>
              <Settings className="mr-2 h-4 w-4" />
              {notifications ? "Desativar notificações" : "Ativar notificações"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                endSession();
                window.dispatchEvent(new Event("d21:session-change"));
                toast.success("Sessão encerrada", { description: "Seus dados ficam salvos." });
                navigate("/bem-vindo", { replace: true });
              }}
              className="text-danger focus:text-danger"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User info bar */}
      <div className="mx-auto max-w-md px-5 pb-3 pt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{displayName || "Visitante"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email || "sem email"}</p>
          </div>
          <div className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {progress}/21 dias
          </div>
        </div>
      </div>
    </header>
  );
}
