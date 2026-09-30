import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./chatbotService";

const WEBHOOK = "https://n8n.example.com/webhook/abc123/chat";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("VITE_N8N_CHAT_URL", WEBHOOK);

  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function mockResponse(body, { status = 200, contentType = "application/json" } = {}) {
  const text =
    typeof body === "string" ? body : body == null ? "" : JSON.stringify(body);

  fetchMock.mockResolvedValueOnce(
    new Response(text, {
      status,
      headers: { "Content-Type": contentType },
    }),
  );
}

describe("chatbotService", () => {
  it.each([
    ["output", { output: "Olá! Posso ajudar?" }, "Olá! Posso ajudar?"],
    ["text", { text: "Resposta em texto" }, "Resposta em texto"],
    ["message", { message: "Mensagem direta" }, "Mensagem direta"],
    ["reply", { reply: "Resposta" }, "Resposta"],
    [
      "objeto aninhado em json",
      { json: { output: "Aninhado" } },
      "Aninhado",
    ],
  ])(
    "extrai a resposta do payload n8n usando a chave %s",
    async (_label, body, expected) => {
      mockResponse(body);

      const reply = await sendChatMessage({
        message: "Oi",
        sessionId: "sessao-1",
      });

      expect(reply).toBe(expected);
    },
  );

  it("envia chatInput e sessionId para o webhook via POST", async () => {
    mockResponse({ output: "ok" });

    await sendChatMessage({ message: "Fale sobre projetos", sessionId: "abc-123" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(WEBHOOK);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Accept).toContain("application/json");

    expect(JSON.parse(options.body)).toEqual({
      chatInput: "Fale sobre projetos",
      sessionId: "abc-123",
    });

    expect(options.signal).toBeDefined();
    expect(options.signal.aborted).toBe(false);
  });

  it("aceita resposta em texto puro", async () => {
    mockResponse("Resposta crua do webhook", {
      contentType: "text/plain",
    });

    const reply = await sendChatMessage({
      message: "oi",
      sessionId: "sessao",
    });

    expect(reply).toBe("Resposta crua do webhook");
  });

  it("lança erro com a mensagem retornada pelo servidor em respostas HTTP de erro", async () => {
    mockResponse(
      { message: "Webhook não está registrado." },
      { status: 404 },
    );

    await expect(
      sendChatMessage({ message: "oi", sessionId: "s" }),
    ).rejects.toThrow("Webhook não está registrado.");
  });

  it("usa uma mensagem padrão quando a resposta de erro não traz detalhes", async () => {
    mockResponse({}, { status: 500 });

    await expect(
      sendChatMessage({ message: "oi", sessionId: "s" }),
    ).rejects.toThrow(/erro 500/i);
  });

  it.each([
    ["falha de conexão", new TypeError("Failed to fetch")],
    ["timeout", new DOMException("Timeout", "TimeoutError")],
  ])("trata %s sem confirmar a resposta", async (_label, error) => {
    fetchMock.mockRejectedValueOnce(error);

    await expect(
      sendChatMessage({ message: "oi", sessionId: "s" }),
    ).rejects.toThrow(/conexão/i);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("lança erro quando o servidor responde 200 sem conteúdo válido", async () => {
    mockResponse("", { status: 200 });

    await expect(
      sendChatMessage({ message: "oi", sessionId: "s" }),
    ).rejects.toThrow(/resposta válida/i);
  });

  it("lança erro quando VITE_N8N_CHAT_URL não está configurada", async () => {
    vi.stubEnv("VITE_N8N_CHAT_URL", "");

    await expect(
      sendChatMessage({ message: "oi", sessionId: "s" }),
    ).rejects.toThrow(/indisponível/i);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});