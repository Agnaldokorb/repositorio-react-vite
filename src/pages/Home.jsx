import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { useProjects } from "@/hooks/useProjects";
import MinhaImagem from "@/components/layout/minhaImagem";

const technologies = ["React", "JavaScript", "Tailwind CSS", "Supabase"];

export default function Home({ onProjectsClick }) {
  const { projects, loading, error } = useProjects();

  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 3);

  function handleProjectsClick(event) {
  if (
    !onProjectsClick ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  event.preventDefault()
  onProjectsClick()
}

  return (
    <main>
      {/* Apresentação */}
      <section aria-labelledby="intro-title" className="border-b border-border">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              OLÁ, EU SOU AGNALDO KORB
            </p>

            <h1
              id="intro-title"
              className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Conheça meu trabalho, projeto por projeto.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Este é meu espaço para apresentar o que estou construindo,
              compartilhar aprendizados e criar novas conexões.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/projetos"
                onClick={handleProjectsClick}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Conhecer projetos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <Link
                to="/contato"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Entrar em contato
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Identidade visual */}
          <MinhaImagem />
        </div>
      </section>

      {/* Tecnologias deste portfólio */}
      <section
        aria-labelledby="technologies-title"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h2
            id="technologies-title"
            className="text-sm font-medium text-muted-foreground"
          >
            Tecnologias deste portfólio
          </h2>

          <ul className="flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Projetos em destaque */}
      <section
        aria-labelledby="projects-title"
        className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Do planejamento à prática
            </p>

            <h2
              id="projects-title"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Projetos em destaque
            </h2>
          </div>

          <Link
            to="/projetos"
            onClick={handleProjectsClick}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Ver todos os projetos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ProjectsGrid
          projects={featuredProjects}
          loading={loading}
          error={error}
          emptyMessage="Novos destaques serão publicados em breve."
        />
      </section>

      {/* Convite para contato */}
      <section
        aria-labelledby="contact-title"
        className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6 md:pb-24"
      >
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/40 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg space-y-3">
            <h2
              id="contact-title"
              className="text-2xl font-bold tracking-tight"
            >
              Vamos trocar uma ideia?
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              Se algum projeto chamou sua atenção ou você quer conversar sobre
              uma ideia, entre em contato.
            </p>
          </div>

          <Link
            to="/contato"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Falar comigo
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
