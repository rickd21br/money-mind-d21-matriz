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
          "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-smooth",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <Icon
          className={cn("h-5 w-5 transition-smooth", isActive && "scale-110")}
          strokeWidth={isActive ? 2.5 : 2}
        />
      )}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="relative mx-auto flex h-14 max-w-md items-center px-2 pb-2 pt-1">
        {/* Left icons */}
        <div className="flex flex-1 items-center">
          {leftTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>

        {/* Center elevated button */}
        <div className="flex w-16 items-start justify-center">
          <AddTransactionDialog
            trigger={
              <button
                type="button"
                aria-label="Novo Lançamento"
                className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-floating ring-4 ring-card transition-smooth hover:opacity-90 active:scale-95"
              >
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </button>
            }
          />
        </div>

        {/* Right icons */}
        <div className="flex flex-1 items-center">
          {rightTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>
      </div>
    </nav>
  );
}
