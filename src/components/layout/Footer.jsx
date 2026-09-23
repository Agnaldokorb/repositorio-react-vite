import { Link, NavLink } from "react-router";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/layout/Logo";
import novoCodeLogo from "@/assets/img/novocode/logo-login.png";

const navigation = [
  { to: "/", label: "Início" },
  { to: "/projetos", label: "Projetos" },
  { to: "/contato", label: "Contato" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="hidden gap-10 py-12 md:grid md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-12">
          {/* Identidade */}
          <div className="space-y-4">
            <Logo />

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Um espaço para compartilhar meus projetos, minha trajetória e o
              que estou construindo.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Navegação do rodapé">
            <h2 className="mb-3 text-sm font-semibold">Explore</h2>

            <ul className="space-y-1">
              {navigation.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      [
                        "inline-flex min-h-11 items-center rounded-md",
                        "text-sm transition-colors",
                        "focus-visible:outline-2",
                        "focus-visible:outline-offset-4",
                        "focus-visible:outline-ring",
                        isActive
                          ? "font-medium text-foreground underline underline-offset-4"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contato */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Vamos conversar?
            </h2>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tem uma ideia ou quer saber mais sobre meu trabalho? Entre em
              contato.
            </p>

            <Link
              to="/contato"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:w-auto"
            >
              Entrar em contato
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Faixa inferior */}
        <div className="flex flex-col gap-4 border-t border-border py-6 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Agnaldo Korb. Todos os direitos reservados.</p>

          <div className="flex flex-wrap items-center gap-3">
            <p>Feito com atenção aos detalhes.</p>

            <img
              src={novoCodeLogo}
              alt="NovoCode Tecnologia"
              loading="lazy"
              decoding="async"
              className="h-auto w-24 shrink-0 object-contain sm:w-28"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
