import { NavLink } from "react-router-dom";
import { Home, Target, BarChart3, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "./AddTransactionDialog";

const leftTabs = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/jornada", label: "Jornada", icon: Target },
];

const rightTabs = [
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: User },
];

function TabLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex min-w-[60px] flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-smooth",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("h-5 w-5 transition-smooth", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
          <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="relative mx-auto flex max-w-md items-end justify-between px-3 pb-2 pt-2">
        <div className="flex flex-1 items-center justify-around">
          {leftTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>

        {/* Central elevated action */}
        <div className="flex w-[96px] flex-col items-center">
          <AddTransactionDialog
            trigger={
              <button
                type="button"
                aria-label="Novo Lançamento"
                className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-floating ring-4 ring-card transition-smooth hover:opacity-90 active:scale-95"
              >
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              </button>
            }
          />
          <span className="mt-1 text-[11px] font-semibold text-primary">Novo Lançamento</span>
        </div>

        <div className="flex flex-1 items-center justify-around">
          {rightTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>
      </div>
    </nav>
  );
}
