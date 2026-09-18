import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, FolderCode } from 'lucide-react'
import { getProjectImageUrl } from '@/lib/projectImages'

export default function ProjectCard({ project }) {
  const [failedUrl, setFailedUrl] = useState(null)
  const imageUrl = getProjectImageUrl(project.cover_path)
  const showImage = imageUrl && failedUrl !== imageUrl

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
      <div className="aspect-video overflow-hidden border-b border-border bg-muted/50">
        {showImage ? (
          <img
            src={imageUrl}
            alt={`Capa do projeto ${project.title}`}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            onError={() => setFailedUrl(imageUrl)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FolderCode
              className="size-14 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Capa indisponível</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {project.title}
        </h2>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <ul
          aria-label="Tecnologias utilizadas"
          className="flex flex-wrap gap-2"
        >
          {project.technologies.map((technology) => (
            <li
              key={technology}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {technology}
            </li>
          ))}
        </ul>

        <Link
          to={`/projetos/${project.slug}`}
          aria-label={`Ver projeto: ${project.title}`}
          className="mt-auto inline-flex min-h-11 items-center justify-between gap-3 rounded-lg pt-3 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Ver projeto
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}