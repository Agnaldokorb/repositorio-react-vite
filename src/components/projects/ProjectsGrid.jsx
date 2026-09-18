import ProjectCard from '@/components/projects/ProjectCard'
import { Spinner } from '../ui/spinner'

export default function ProjectsGrid({
  projects,
  loading,
  error,
  emptyMessage = 'Novos projetos serão publicados em breve.',
}) {
  if (loading) {
    return (
      <p
        role="status"
        className="py-12 text-center text-muted-foreground"
      >
        <Spinner className="size-5" />
        Carregando projetos...
      </p>
    )
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive"
      >
        {error}
      </p>
    )
  }

  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}