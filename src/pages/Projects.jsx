import ProjectCard from '@/components/projects/ProjectCard'
import { projects } from '@/data/projects'

export default function Projects() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-20">
      <div className="mb-8 max-w-2xl space-y-4 md:mb-12">
        <p className="text-sm font-medium text-muted-foreground">
          Portfólio
        </p>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Meus projetos
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Conheça o que estou construindo e as tecnologias
          utilizadas em cada projeto.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Novos projetos serão publicados em breve.
        </p>
      )}
    </main>
  )
}