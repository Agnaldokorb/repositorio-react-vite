import { Link } from 'react-router'

export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="Agnaldo Korb — página inicial"
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-black tracking-tighter text-primary-foreground"
      >
        AK<span className="text-primary-foreground/60">.</span>
      </span>

      <span className="flex flex-col">
        <span className="text-base font-bold tracking-tight sm:text-lg">
          Agnaldo Korb
        </span>

        <span className="text-xs text-muted-foreground">
          Portfólio profissional
        </span>
      </span>
    </Link>
  )
}