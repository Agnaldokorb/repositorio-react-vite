import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProjectPreviewLink({
  url,
  title,
  className,
}) {
  if (typeof url !== 'string' || !url.trim()) return null

  let previewUrl

  try {
    previewUrl = new URL(url.trim())
  } catch {
    return null
  }

  if (
    previewUrl.protocol !== 'https:' ||
    previewUrl.username ||
    previewUrl.password
  ) {
    return null
  }

  return (
    <a
      href={previewUrl.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver projeto online: ${title} (abre em nova aba)`}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2',
        'rounded-lg bg-primary px-4 py-2',
        'text-sm font-semibold text-primary-foreground',
        'transition-colors hover:bg-primary/90',
        'focus-visible:outline-2 focus-visible:outline-offset-4',
        'focus-visible:outline-ring',
        className,
      )}
    >
      Ver projeto online
      <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
    </a>
  )
}