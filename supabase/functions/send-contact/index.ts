const allowedOrigins = new Set([
  "https://agnaldo.dev.br",
  "https://www.agnaldo.dev.br",
  "http://localhost:5173",
  "http://localhost:4173",
]);

const allowedHostnames = new Set(["agnaldo.dev.br", "www.agnaldo.dev.br"]);

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };

  function respond(status: number, body: Record<string, unknown>) {
    return new Response(JSON.stringify(body), { status, headers });
  }

  if (!allowedOrigins.has(origin)) {
    return respond(403, { error: "Origem não permitida." });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return respond(405, { error: "Método não permitido." });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return respond(415, { error: "Envie os dados em formato JSON." });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const turnstileKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  const from = Deno.env.get("CONTACT_FROM_EMAIL");
  const to = Deno.env.get("CONTACT_TO_EMAIL");

  if (!resendKey || !turnstileKey || !from || !to) {
    return respond(503, {
      error: "O formulário está temporariamente indisponível.",
    });
  }

  try {
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).length > 20_000) {
      return respond(413, { error: "Os dados enviados são muito grandes." });
    }

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return respond(400, { error: "Os dados enviados são inválidos." });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return respond(400, { error: "Os dados enviados são inválidos." });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const token =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";

    if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) {
      return respond(400, {
        error: "Informe um nome válido, de 2 a 100 caracteres.",
      });
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond(400, { error: "Informe um e-mail válido." });
    }

    if (message.length < 10 || message.length > 2000) {
      return respond(400, {
        error: "A mensagem deve ter entre 10 e 2.000 caracteres.",
      });
    }

    if (!token || token.length > 2048) {
      return respond(400, {
        error: "Conclua a verificação de segurança.",
      });
    }

    const verificationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: turnstileKey,
          response: token,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!verificationResponse.ok) {
      return respond(503, {
        error: "Não foi possível verificar o envio. Tente novamente.",
      });
    }

    const verification = await verificationResponse.json();

    if (
      verification.success !== true ||
      !allowedHostnames.has(verification.hostname) ||
      verification.action !== "contact"
    ) {
      return respond(400, {
        error:
          "Verificação de segurança inválida ou expirada. Tente novamente.",
      });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "Novo contato pelo portfólio",
        text: [
          "Você recebeu uma solicitação pelo portfólio.",
          "",
          `Nome: ${name}`,
          `E-mail: ${email}`,
          "",
          "Mensagem:",
          message,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!emailResponse.ok) {
      console.error(
        "Falha no envio pelo Resend. Status:",
        emailResponse.status,
      );

      return respond(502, {
        error:
          "Não foi possível enviar sua mensagem. Tente novamente mais tarde.",
      });
    }

    return respond(200, {
      success: true,
      message: "Sua mensagem foi aceita para envio. Obrigado pelo contato!",
    });
  } catch {
    console.error("Falha de comunicação na função send-contact.");

    return respond(503, {
      error: "Não foi possível confirmar o envio. Tente novamente mais tarde.",
    });
  }
});
