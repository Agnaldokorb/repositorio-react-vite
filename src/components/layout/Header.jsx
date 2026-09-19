import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";

import Logo from "@/components/layout/Logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { to: "/", label: "Início" },
  { to: "/projetos", label: "Projetos" },
  { to: "/contato", label: "Contato" },
];

export default function Header({ onProjectsClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingProjectsRef = useRef(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");

    function handleResize(event) {
      if (event.matches) {
        setMenuOpen(false);
      }
    }

    desktop.addEventListener("change", handleResize);

    return () => {
      desktop.removeEventListener("change", handleResize);
    };
  }, []);

  function handleNavigation(event, to, mobile = false) {
    // Mantém o comportamento de abrir links em outra aba.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (to !== "/projetos" || !onProjectsClick) {
      if (mobile) {
        pendingProjectsRef.current = false;
        setMenuOpen(false);
      }

      return;
    }

    event.preventDefault();

    // Aguarda o menu mobile fechar antes de abrir a introdução.
    if (mobile && menuOpen) {
      pendingProjectsRef.current = true;
      setMenuOpen(false);
      return;
    }

    onProjectsClick();
  }

  function handleMenuAnimationComplete(open) {
    if (!open && pendingProjectsRef.current) {
      pendingProjectsRef.current = false;
      onProjectsClick?.();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Menu desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-2 md:flex"
        >
          {navigation.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={(event) => handleNavigation(event, to)}
              className={({ isActive }) =>
                [
                  "inline-flex min-h-11 items-center rounded-lg px-4",
                  "text-sm font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-4",
                  "focus-visible:outline-ring",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Menu mobile */}
        <Sheet
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onOpenChangeComplete={handleMenuAnimationComplete}
        >
          <SheetTrigger
            aria-label="Abrir menu de navegação"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>

          <SheetContent
            side="right"
            showCloseButton={false}
            className="overflow-y-auto"
          >
            <SheetClose
              aria-label="Fechar menu de navegação"
              className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </SheetClose>

            <SheetHeader className="border-b border-border px-6 pb-6 pt-16">
              <SheetTitle className="text-xl font-bold">
                Agnaldo Korb
              </SheetTitle>

              <SheetDescription>
                Conheça meu trabalho e entre em contato.
              </SheetDescription>
            </SheetHeader>

            <nav
              aria-label="Navegação mobile"
              className="flex flex-col gap-2 px-4 py-2"
            >
              {navigation.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={(event) => handleNavigation(event, to, true)}
                  className={({ isActive }) =>
                    [
                      "flex min-h-14 items-center justify-between",
                      "rounded-xl px-4 text-base font-medium",
                      "transition-colors focus-visible:outline-2",
                      "focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <span>{label}</span>
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>

            <p className="mt-auto px-6 py-6 text-xs text-muted-foreground">
              Portfólio profissional
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
