import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-16">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>

      <p className="text-muted-foreground">
        O endereço acessado não existe.
      </p>

      <Link to="/" className="underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  )
}