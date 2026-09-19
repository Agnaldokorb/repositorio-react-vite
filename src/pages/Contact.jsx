import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowUpRight, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/schemas/contactSchema";
import { sendContact } from "@/services/contactService";

export default function Contact() {
  const [feedback, setFeedback] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [securityError, setSecurityError] = useState("");

  const turnstileRef = useRef(null);
  const sendingRef = useRef(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onBlur",
  });

  function handleSecurityError() {
    setTurnstileToken("");
    setSecurityError(
      "Não foi possível carregar a verificação. Atualize a página ou envie um e-mail para contato@agnaldo.dev.br.",
    );
  }

  async function handleValidForm(values) {
    if (sendingRef.current) return;

    setFeedback("");

    if (!turnstileToken) {
      setSecurityError("Conclua a verificação de segurança antes de enviar.");
      return;
    }

    sendingRef.current = true;
    setSecurityError("");

    try {
      await sendContact(values, turnstileToken);

      reset();
      setFeedback("Sua mensagem foi aceita para envio. Obrigado pelo contato!");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua mensagem. Tente novamente.",
      );
    } finally {
      sendingRef.current = false;
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <section aria-labelledby="contact-title" className="space-y-6">
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"
          >
            <MessageSquare className="size-6" />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">CONTATO</p>

            <h1
              id="contact-title"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Vamos conversar?
            </h1>

            <p className="max-w-lg leading-relaxed text-muted-foreground">
              Tem uma ideia, uma sugestão ou quer conhecer melhor meu trabalho?
              Envie sua mensagem pelo formulário.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <a
              href="mailto:contato@agnaldo.dev.br"
              className="inline-flex min-h-11 items-center break-all rounded-lg text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              contato@agnaldo.dev.br
            </a>

            <a
              href="https://github.com/Agnaldokorb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Ver meu GitHub
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> — abre em uma nova aba</span>
            </a>
          </div>
        </section>

        <section
          aria-labelledby="form-title"
          className="min-w-0 rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-8"
        >
          <h2 id="form-title" className="text-xl font-semibold">
            Sua mensagem
          </h2>

          <p
            id="form-notice"
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            Sua mensagem será encaminhada para meu e-mail. Todos os campos são
            obrigatórios.
          </p>

          <form
            noValidate
            aria-describedby="form-notice"
            aria-busy={isSubmitting}
            onSubmit={(event) => {
              void handleSubmit(handleValidForm, () => setFeedback(""))(event);
            }}
            onChange={() => setFeedback("")}
            className="mt-6 space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nome</Label>

              <Input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder="Como você se chama?"
                required
                readOnly={isSubmitting}
                maxLength={100}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "contact-name-error" : undefined
                }
                className="min-h-12 text-base md:text-base"
                {...register("name")}
              />

              {errors.name && (
                <p
                  id="contact-name-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">E-mail</Label>

              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="voce@exemplo.com"
                required
                readOnly={isSubmitting}
                maxLength={254}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                className="min-h-12 text-base md:text-base"
                {...register("email")}
              />

              {errors.email && (
                <p
                  id="contact-email-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Mensagem</Label>

              <Textarea
                id="contact-message"
                placeholder="Conte um pouco sobre sua ideia..."
                required
                readOnly={isSubmitting}
                rows={6}
                maxLength={2000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message
                    ? "contact-message-help contact-message-error"
                    : "contact-message-help"
                }
                className="min-h-40 resize-y text-base md:text-base"
                {...register("message")}
              />

              <p
                id="contact-message-help"
                className="text-xs text-muted-foreground"
              >
                Entre 10 e 2.000 caracteres.
              </p>

              {errors.message && (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {siteKey ? (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  options={{
                    action: "contact",
                    theme: "auto",
                    size: "compact",
                    language: "pt-BR",
                  }}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setSecurityError("");
                  }}
                  onExpire={() => setTurnstileToken("")}
                  onTimeout={() => setTurnstileToken("")}
                  onError={handleSecurityError}
                  onUnsupported={handleSecurityError}
                  scriptOptions={{
                    onError: handleSecurityError,
                  }}
                />
              ) : (
                <p role="alert" className="text-sm text-destructive">
                  O formulário está temporariamente indisponível. Entre em
                  contato pelo e-mail contato@agnaldo.dev.br.
                </p>
              )}

              {securityError && (
                <p role="alert" className="text-sm text-destructive">
                  {securityError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !siteKey || !turnstileToken}
              className="min-h-12 w-full sm:w-auto sm:px-6"
            >
              {isSubmitting ? "Enviando..." : "Enviar mensagem"}
            </Button>

            <p
              role="status"
              aria-atomic="true"
              className="text-sm text-muted-foreground"
            >
              {feedback}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
