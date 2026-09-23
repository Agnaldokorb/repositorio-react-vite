import { useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  Clock3,
  ExternalLink,
} from "lucide-react";

function getCertificateUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:" || url.username || url.password) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function formatCompletionDate(value) {
  if (typeof value !== "string") return null;

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function CourseCard({ course }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  const completed = course.status === "completed";
  const certificateUrl = completed
    ? getCertificateUrl(course.certificate_image_url)
    : null;

  const showCertificate = certificateUrl && failedImageUrl !== certificateUrl;

  const completionDate = formatCompletionDate(course.completed_at);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
      {completed && (
        <div className="border-b border-border bg-muted/40">
          {showCertificate ? (
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ampliar certificado de ${course.title} (abre em nova aba)`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
            >
              <img
                src={certificateUrl}
                alt={`Certificado de conclusão de ${course.title}`}
                loading="lazy"
                decoding="async"
                onError={() => setFailedImageUrl(certificateUrl)}
                className="aspect-[4/3] w-full object-contain p-3 transition-opacity group-hover:opacity-90"
              />

              <span className="flex min-h-11 items-center justify-center gap-2 px-4 pb-3 text-sm font-medium">
                Ampliar certificado
                <ExternalLink className="size-4" aria-hidden="true" />
              </span>
            </a>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
              <Award
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />

              <p className="text-sm text-muted-foreground">
                {certificateUrl
                  ? "Não foi possível carregar o certificado."
                  : "Certificado ainda não disponível."}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {completed ? (
            <Award className="size-3.5" aria-hidden="true" />
          ) : (
            <BookOpen className="size-3.5" aria-hidden="true" />
          )}

          {completed ? "Concluído" : "Em formação"}
        </span>

        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {course.title}
          </h3>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {course.institution}
          </p>
        </div>

        {course.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-3 pt-2 text-sm text-muted-foreground">
          {course.workload_hours > 0 && (
            <p className="inline-flex items-center gap-2">
              <Clock3 className="size-4" aria-hidden="true" />
              {course.workload_hours} horas
            </p>
          )}

          {completed && completionDate && (
            <p className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              Concluído em {completionDate}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
