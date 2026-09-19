export async function sendContact(values, turnstileToken) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("O formulário está temporariamente indisponível.");
  }

  let response;

  try {
    response = await fetch(`${url}/functions/v1/send-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        message: values.message,
        turnstileToken,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new Error(
      "Não foi possível confirmar o envio. Confira sua conexão e tente novamente mais tarde.",
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || "Não foi possível enviar sua mensagem.");
  }

  if (result?.success !== true) {
    throw new Error("Não foi possível confirmar o envio da mensagem.");
  }

  return result;
}
