import { GraduationCap } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/education/CourseCard";

export default function Education() {
  const { courses, loading, error } = useCourses();

  const inProgress = courses.filter(
    (course) => course.status === "in_progress",
  );

  const completed = courses.filter((course) => course.status === "completed");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 md:py-20">
      <header className="mb-10 max-w-2xl">
        <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-card">
          <GraduationCap className="size-6" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Formação
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Minha trajetória de aprendizado, os cursos que concluí e os
          conhecimentos que sigo desenvolvendo.
        </p>
      </header>

      {loading ? (
        <p role="status" className="text-muted-foreground">
          Carregando formação...
        </p>
      ) : error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">
          Minha formação será publicada em breve.
        </p>
      ) : (
        <div className="space-y-14">
          <section aria-labelledby="education-in-progress">
            <h2
              id="education-in-progress"
              className="mb-6 text-2xl font-semibold tracking-tight"
            >
              Em formação
            </h2>

            {inProgress.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {inProgress.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma formação em andamento publicada no momento.
              </p>
            )}
          </section>

          <section aria-labelledby="education-completed">
            <h2
              id="education-completed"
              className="mb-6 text-2xl font-semibold tracking-tight"
            >
              Concluídos
            </h2>

            {completed.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {completed.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum curso concluído publicado no momento.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
