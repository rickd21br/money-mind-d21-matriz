import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

interface MobileShellProps {
  children: ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-transparent">
      <TopBar />
      <main className="flex-1 px-5 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
