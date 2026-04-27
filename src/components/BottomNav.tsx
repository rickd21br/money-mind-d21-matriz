import { NavLink } from "react-router-dom";
import { Home, Target, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/jornada", label: "Jornada", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-smooth",
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
        ))}
      </div>
    </nav>
  );
}
