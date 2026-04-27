import { useEffect } from "react";
import { useStorage } from "./useStorage";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useStorage<Theme>("d21.theme", "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
