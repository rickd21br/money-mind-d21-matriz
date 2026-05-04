import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Audios from "./pages/Audios";
import Calculator from "./pages/Calculator";
import MeuNegocio from "./pages/MeuNegocio";
import Vitrine from "./pages/Vitrine";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound.tsx";
import { useStorage } from "./hooks/useStorage";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const [onboarded] = useStorage<boolean>("d21.onboarded", false);
  const hasSession = typeof window !== "undefined" && !!localStorage.getItem("d21.activeUser");
  if (!hasSession || !onboarded) return <Navigate to="/bem-vindo" replace />;
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
          <Route path="/audios" element={<RequireOnboarding><Audios /></RequireOnboarding>} />
          <Route path="/calculadora" element={<RequireOnboarding><Calculator /></RequireOnboarding>} />
          <Route path="/meu-negocio" element={<RequireOnboarding><MeuNegocio /></RequireOnboarding>} />
          <Route path="/vitrine" element={<RequireOnboarding><Vitrine /></RequireOnboarding>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
