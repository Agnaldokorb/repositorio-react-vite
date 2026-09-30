const RESPONSE_KEYS = ["output", "text", "message", "reply", "response", "answer"];

function extractReply(payload) {
  if (payload == null) return "";

  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const reply = extractReply(item);
      if (reply) return reply;
    }
    return "";
  }

  if (typeof payload === "object") {
    for (const key of RESPONSE_KEYS) {
      const value = payload[key];

      if (typeof value === "string" && value.trim()) {
        return value;
      }

      if (value && typeof value === "object") {
        const nested = extractReply(value);
        if (nested) return nested;
      }
    }

    const json = payload.json ?? payload.data;

    if (json && typeof json === "object") {
      const nested = extractReply(json);
      if (nested) return nested;
    }
  }

  return "";
}

export async function sendChatMessage({ message, sessionId }) {
  const url = import.meta.env.VITE_N8N_CHAT_URL;

  if (!url) {
    throw new Error("O chatbot está temporariamente indisponível.");
  }

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.9, */*;q=0.5",
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new Error(
      "Não foi possível falar com o assistente. Confira sua conexão e tente novamente.",
    );
  }

  const rawText = await response.text();
  const payload = rawText ? safeJsonParse(rawText) : null;

  if (!response.ok) {
    const reply = extractReply(payload);

    throw new Error(
      reply ||
        payload?.message ||
        `O assistente respondeu com erro ${response.status}.`,
    );
  }

  const reply = extractReply(payload) || rawText.trim();

  if (!reply) {
    throw new Error("O assistente não enviou uma resposta válida.");
  }

  return reply;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}