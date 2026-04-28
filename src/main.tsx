import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./pwa";

createRoot(document.getElementById("root")!).render(<App />);

// Registra o Service Worker apenas em produção real e fora de iframes/preview.
registerPWA();
