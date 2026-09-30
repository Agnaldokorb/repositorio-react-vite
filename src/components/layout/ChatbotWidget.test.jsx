import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatbotWidget from "./ChatbotWidget";

const CHAT_URL = "https://n8n.example.com/webhook/abc123/chat";

let fetchMock;

beforeEach(() => {
  vi.stubEnv("VITE_N8N_CHAT_URL", CHAT_URL);

  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

function mockReply(body, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("ChatbotWidget", () => {
  it("não renderiza nada quando VITE_N8N_CHAT_URL não está configurada", () => {
    vi.stubEnv("VITE_N8N_CHAT_URL", "");

    const { container } = render(<ChatbotWidget />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("button", { name: /assistente virtual/i }),
    ).not.toBeInTheDocument();
  });

  it("abre o painel com a mensagem de boas-vindas e foca o input", async () => {
    const user = userEvent.setup();

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /assistente virtual/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Sou o assistente virtual do Agnaldo/i),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: /mensagem/i })).toHaveFocus(),
    );
  });

  it("envia a mensagem via POST para o webhook e mostra a resposta", async () => {
    const user = userEvent.setup();

    mockReply({ output: "Posso contar sobre os projetos publicados." });

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    const input = screen.getByRole("textbox", { name: /mensagem/i });
    await user.type(input, "Fale sobre seus projetos{Enter}");

    expect(await screen.findByText(/Posso contar sobre os projetos/i)).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(CHAT_URL);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const payload = JSON.parse(options.body);
    expect(payload.chatInput).toBe("Fale sobre seus projetos");
    expect(payload.sessionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("exibe uma mensagem de erro quando a requisição falha", async () => {
    const user = userEvent.setup();

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    const input = screen.getByRole("textbox", { name: /mensagem/i });
    await user.type(input, "Olá{Enter}");

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/conexão/i);
  });

  it("reinicia a conversa ao clicar no botão de reiniciar", async () => {
    const user = userEvent.setup();

    mockReply({ output: "Tudo bem?" });

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    const input = screen.getByRole("textbox", { name: /mensagem/i });
    await user.type(input, "Oi{Enter}");

    expect(await screen.findByText("Tudo bem?")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /reiniciar conversa/i }),
    );

    expect(screen.queryByText("Tudo bem?")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Sou o assistente virtual do Agnaldo/i),
    ).toBeInTheDocument();
  });

  it("fecha o painel ao pressionar Escape", async () => {
    const user = userEvent.setup();

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /assistente virtual/i }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /assistente virtual/i }),
      ).not.toBeInTheDocument(),
    );

    expect(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    ).toHaveFocus();
  });

  it("não envia mensagens vazias", async () => {
    const user = userEvent.setup();

    render(<ChatbotWidget />);

    await user.click(
      screen.getByRole("button", { name: /abrir assistente virtual/i }),
    );

    await user.type(
      screen.getByRole("textbox", { name: /mensagem/i }),
      "{Enter}",
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reusa o sessionId entre renders", () => {
    const { unmount } = render(<ChatbotWidget />);

    const sessionId = sessionStorage.getItem("portfolio:chatbot-session-id");
    expect(sessionId).not.toBeNull();

    unmount();

    render(<ChatbotWidget />);

    expect(sessionStorage.getItem("portfolio:chatbot-session-id")).toBe(
      sessionId,
    );
  });
});