import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm text-muted-foreground">Portfólio profissional</p>

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Agnaldo Korb
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Conheça meus projetos, minha trajetória e minhas habilidades.
        </p>

        <Button>Conhecer meus projetos</Button>
      </div>
    </main>
  );
}
