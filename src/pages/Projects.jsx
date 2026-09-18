import { Link } from 'react-router'

export default function Projects() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-16">
      <h1 className="text-4xl font-bold">Meus projetos</h1>

      <p className="text-muted-foreground">
        Aqui você encontrará meus trabalhos.
      </p>

      <Link
        to="/projetos/projeto-exemplo"
        className="underline underline-offset-4"
      >
        Abrir projeto de exemplo
      </Link>
    </main>
  )
}