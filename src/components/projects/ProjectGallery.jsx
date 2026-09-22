import {
  lazy,
  Suspense,
  useMemo,
  useSyncExternalStore,
} from 'react'

const CircularGallery = lazy(() =>
  import('@/components/ui/circular-gallery-2').then((module) => ({
    default: module.CircularGallery,
  })),
)

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback) {
  const media = window.matchMedia(MOTION_QUERY)
  media.addEventListener('change', callback)

  return () => {
    media.removeEventListener('change', callback)
  }
}

function getSnapshot() {
  return window.matchMedia(MOTION_QUERY).matches
}

function getServerSnapshot() {
  return true
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return []

  return images.flatMap((item, index) => {
    if (!item || typeof item.src !== 'string') return []

    let url

    try {
      url = new URL(item.src.trim())
    } catch {
      return []
    }

    if (url.protocol !== 'https:') return []

    const label = typeof item.label === 'string'
      ? item.label.trim()
      : ''

    const alt = typeof item.alt === 'string'
      ? item.alt.trim()
      : ''

    return [{
      image: url.href,
      text: label || alt || `Imagem ${index + 1}`,
      alt: alt || label || `Imagem ${index + 1} do projeto`,
    }]
  })
}

export default function ProjectGallery({ images }) {
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const items = useMemo(() => normalizeImages(images), [images])

  if (!items.length) return null

  const staticGallery = reducedMotion || items.length === 1

  return (
    <section
      aria-label="Galeria do projeto"
      className="w-full pb-12"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Imagens do projeto
        </h2>

        {!staticGallery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Arraste para os lados ou utilize os botões para navegar.
          </p>
        )}
      </div>

      {staticGallery ? (
        <ul className="mx-auto mt-6 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {items.map((item, index) => (
            <li key={`${item.image}-${index}`}>
              <figure className="overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-contain"
                />

                <figcaption className="p-4 text-sm font-medium text-card-foreground">
                  {item.text}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <Suspense
          fallback={
            <p
              role="status"
              className="px-4 py-16 text-center text-sm text-foreground"
            >
              Carregando galeria...
            </p>
          }
        >
          <CircularGallery
            key={JSON.stringify(items)}
            items={items}
            bend={1.5}
            borderRadius={0.05}
            scrollSpeed={1}
            scrollEase={0.06}
          />
        </Suspense>
      )}
    </section>
  )
}