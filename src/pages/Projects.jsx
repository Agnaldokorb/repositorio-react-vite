import ProjectsGrid from '@/components/projects/ProjectsGrid'
import { useProjects } from '@/hooks/useProjects'

export default function Projects() {
  const { projects, loading, error } = useProjects()

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

      <ProjectsGrid
        projects={projects}
        loading={loading}
        error={error}
      />
    </main>
  )
}