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
          "flex flex-1 flex-col items-center justify-end gap-1 pt-1 transition-smooth",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn("h-5 w-5 transition-smooth", isActive && "scale-110")}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span className={cn("text-[10px] leading-none", isActive && "font-semibold")}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="relative mx-auto flex h-16 max-w-md items-end px-2 pb-2">
        {/* Left icons */}
        <div className="flex flex-1 items-end">
          {leftTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>

        {/* Center floating action button + label */}
        <div className="flex w-20 flex-col items-center justify-end pb-0">
          <div className="pointer-events-none p-1">
            <AddTransactionDialog
              trigger={
                <button
                  type="button"
                  aria-label="Novo Lançamento"
                  style={{
                    transform: "translateY(-18px)",
                    backgroundColor: "hsl(var(--primary))",
                    boxShadow: "0px 8px 20px rgba(0,0,0,0.18)",
                  }}
                  className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground transition-smooth hover:opacity-90 active:scale-95"
                >
                  <Plus className="h-6 w-6 text-white" strokeWidth={2.75} />
                </button>
              }
            />
          </div>
          <span className="-mt-3 text-[10px] font-semibold leading-none text-primary">
            Novo
          </span>
        </div>

        {/* Right icons */}
        <div className="flex flex-1 items-end">
          {rightTabs.map((t) => (
            <TabLink key={t.to} {...t} />
          ))}
        </div>
      </div>
    </nav>
  );
}
