import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound.tsx";
import { useStorage } from "./hooks/useStorage";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const [onboarded] = useStorage<boolean>("d21.onboarded", false);
  const legacy = typeof window !== "undefined" && localStorage.getItem("onboarding_completed") === "true";
  if (!onboarded && !legacy) return <Navigate to="/bem-vindo" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/bem-vindo" element={<Onboarding />} />
          <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
          <Route path="/jornada" element={<RequireOnboarding><Journey /></RequireOnboarding>} />
          <Route path="/relatorios" element={<RequireOnboarding><Reports /></RequireOnboarding>} />
          <Route path="/perfil" element={<RequireOnboarding><Profile /></RequireOnboarding>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
