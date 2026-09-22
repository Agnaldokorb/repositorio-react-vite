import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import NotFound from "@/pages/NotFound";
import { Spinner } from "@/components/ui/spinner";
import ProjectGallery from "@/components/projects/ProjectGallery";

export default function ProjectDetails() {
  const { slug } = useParams();
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div
          role="status"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span aria-hidden="true">
            <Spinner className="size-5" />
          </span>
          Carregando projeto...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p role="alert" className="text-destructive">
          {error}
        </p>
      </main>
    );
  }

  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return <NotFound />;
  }

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-20">
        <Link
          to="/projetos"
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar aos projetos
        </Link>

        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {project.title}
          </h1>

          <p className="text-lg leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          <ul
            aria-label="Tecnologias utilizadas"
            className="flex flex-wrap gap-2"
          >
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {technology}
              </li>
            ))}
          </ul>

          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-2xl font-semibold">Sobre o projeto</h2>

            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>
        </div>
      </div>

      <ProjectGallery key={project.id} images={project.gallery_images} />
    </main>
  );
}
