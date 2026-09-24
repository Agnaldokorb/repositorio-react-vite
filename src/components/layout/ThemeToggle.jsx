import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "portfolio:theme";

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // O botão continua funcionando sem armazenamento.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  const isDark = theme === "dark";
  const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    setTheme(nextTheme);

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Mantém a escolha enquanto o componente estiver montado.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring md:ml-0"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
