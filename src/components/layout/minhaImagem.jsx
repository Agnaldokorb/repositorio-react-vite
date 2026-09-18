export default function MinhaImagem() {
  const imagePath =
    'https://avatars.githubusercontent.com/u/103047820?v=4'

  return (
    <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-3xl border border-border bg-muted/40 sm:max-w-80 lg:max-w-none">
      <img
        src={imagePath}
        alt="Agnaldo Korb"
        className="h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-5 z-10 rounded-2xl border border-border"
      />

      <span className="absolute left-1/2 top-8 z-20 -translate-x-1/2 whitespace-nowrap  bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm sm:text-sm">
        Agnaldo Korb
      </span>
    </div>
  )
}