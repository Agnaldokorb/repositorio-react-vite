import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Bot, MessageCircle, RefreshCw, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sendChatMessage } from "@/services/chatbotService";

const SESSION_STORAGE_KEY = "portfolio:chatbot-session-id";
const WELCOME_MESSAGE =
  "Olá! Sou o assistente virtual do Agnaldo. Posso falar sobre os projetos, a formação ou tirar dúvidas. Como posso ajudar?";

function readSessionId() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeSessionId(value) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, value);
  } catch {
    // Mantém a sessão apenas enquanto a aba estiver aberta.
  }
}

function ensureSessionId() {
  const existing = readSessionId();

  if (existing) return existing;

  const fresh =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  writeSessionId(fresh);
  return fresh;
}

export default function ChatbotWidget() {
  const chatUrl = import.meta.env.VITE_N8N_CHAT_URL;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: "welcome", role: "assistant", text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionId] = useState(() => ensureSessionId());

  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const sendingRef = useRef(false);
  const titleId = useId();
  const logId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, sending, open]);

  function resetConversation() {
    setMessages([{ id: "welcome", role: "assistant", text: WELCOME_MESSAGE }]);
    setInput("");
    setError("");
    sendingRef.current = false;
    setSending(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const text = input.trim();

    if (!text || sendingRef.current) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    sendingRef.current = true;
    setSending(true);

    try {
      const reply = await sendChatMessage({ message: text, sessionId });

      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", text: reply },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Não foi possível falar com o assistente.";

      setError(message);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  if (!chatUrl) return null;

  const canSend = input.trim().length > 0 && !sending;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar assistente virtual" : "Abrir assistente virtual"}
        aria-expanded={open}
        aria-controls={titleId}
        title="Conversar com o assistente"
        variant="default"
        size="icon-lg"
        className="fixed z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:scale-100"
        style={{
          right: "calc(1rem + env(safe-area-inset-right, 0px))",
          bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <MessageCircle className="size-7" aria-hidden="true" />
      </Button>

      {open && (
        <section
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={logId}
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-foreground/10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          style={{
            right: "calc(1rem + env(safe-area-inset-right, 0px))",
            bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(560px, calc(100dvh - 7rem))",
          }}
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Bot className="size-4" />
              </span>

              <h2
                id={titleId}
                className="text-sm font-semibold tracking-tight"
              >
                Assistente virtual
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                onClick={resetConversation}
                aria-label="Reiniciar conversa"
                title="Reiniciar conversa"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-full"
                disabled={sending}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar assistente virtual"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-full"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </header>

          <div
            ref={scrollRef}
            id={logId}
            role="log"
            aria-live="polite"
            aria-busy={sending}
            className="flex-1 space-y-3 overflow-y-auto bg-background/40 px-4 py-4"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {sending && <TypingIndicator />}
          </div>

          {error && (
            <p
              role="alert"
              className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-border bg-card px-3 py-3"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Mensagem para o assistente
            </label>

            <textarea
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              placeholder="Escreva sua mensagem..."
              rows={1}
              maxLength={1000}
              disabled={sending}
              className="flex max-h-32 min-h-10 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <Button
              type="submit"
              size="icon-sm"
              variant="default"
              disabled={!canSend}
              aria-label="Enviar mensagem"
              className="size-10 shrink-0 rounded-full"
            >
              {sending ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        </section>
      )}
    </>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <p
        className={
          isUser
            ? "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow-sm"
            : "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground shadow-sm"
        }
      >
        {message.text}
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-hidden="true">
      <p className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-muted-foreground shadow-sm">
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current" />
        <span className="sr-only">Assistente digitando</span>
      </p>
    </div>
  );
}