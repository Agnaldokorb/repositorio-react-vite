import { Link, useParams } from 'react-router'

export default function ProjectDetails() {
  const { slug } = useParams()

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-16">
      <h1 className="text-4xl font-bold">Detalhes do projeto</h1>

      <p>Projeto solicitado: {slug}</p>

      <p className="text-muted-foreground">
        Esta página é provisória para testar a navegação.
      </p>

      <Link to="/projetos" className="underline underline-offset-4">
        Voltar aos projetos
      </Link>
    </main>
  )
}