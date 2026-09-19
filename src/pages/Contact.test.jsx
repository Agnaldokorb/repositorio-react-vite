import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Contact from "./Contact";
import { sendContact } from "@/services/contactService";

const { resetTurnstile } = vi.hoisted(() => ({
  resetTurnstile: vi.fn(),
}));

vi.mock("@/services/contactService", () => ({
  sendContact: vi.fn(),
}));

vi.mock("@marsidev/react-turnstile", async () => {
  const { useImperativeHandle } = await import("react");

  function TurnstileMock({ ref, onSuccess, onExpire, onError }) {
    useImperativeHandle(ref, () => ({ reset: resetTurnstile }), []);

    return (
      <div aria-label="Verificação de segurança simulada">
        <button type="button" onClick={() => onSuccess("token-de-teste")}>
          Simular verificação concluída
        </button>

        <button type="button" onClick={() => onExpire()}>
          Simular verificação expirada
        </button>

        <button type="button" onClick={() => onError("erro-de-teste")}>
          Simular erro de verificação
        </button>
      </div>
    );
  }

  return { Turnstile: TurnstileMock };
});

beforeEach(() => {
  vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "site-key-de-teste");
  vi.mocked(sendContact).mockReset().mockResolvedValue({ success: true });
  resetTurnstile.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const validContact = {
  name: "Agnaldo",
  email: "agnaldo@example.com",
  message: "Quero conversar sobre um projeto.",
};

async function fillForm(user) {
  await user.type(screen.getByLabelText("Nome"), validContact.name);
  await user.type(screen.getByLabelText("E-mail"), validContact.email);
  await user.type(screen.getByLabelText("Mensagem"), validContact.message);
}

async function completeVerification(user) {
  await user.click(
    screen.getByRole("button", {
      name: "Simular verificação concluída",
    }),
  );
}

function getSubmitButton() {
  return screen.getByRole("button", { name: "Enviar mensagem" });
}

describe("Formulário de contato", () => {
  it("bloqueia o envio até concluir a verificação de segurança", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await fillForm(user);

    expect(getSubmitButton()).toBeDisabled();

    await user.click(getSubmitButton());

    expect(sendContact).not.toHaveBeenCalled();

    await completeVerification(user);

    expect(getSubmitButton()).toBeEnabled();
    expect(sendContact).not.toHaveBeenCalled();
  });

  it("mostra erros acessíveis e foca o primeiro campo inválido", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await completeVerification(user);
    await user.click(getSubmitButton());

    expect(await screen.findAllByRole("alert")).toHaveLength(3);

    await waitFor(() => {
      expect(screen.getByLabelText("Nome")).toHaveFocus();
    });

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
      "Informe seu e-mail.",
    );

    expect(sendContact).not.toHaveBeenCalled();
  });

  it("valida e-mail ao sair do campo", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText("E-mail"), "invalido");
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe um e-mail válido.",
    );

    expect(sendContact).not.toHaveBeenCalled();
  });

  it("envia os dados e o token, limpa os campos e renova a verificação", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await fillForm(user);
    await completeVerification(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Sua mensagem foi aceita para envio.",
      );
    });

    expect(sendContact).toHaveBeenCalledTimes(1);
    expect(sendContact).toHaveBeenCalledWith(validContact, "token-de-teste");

    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Mensagem")).toHaveValue("");

    expect(resetTurnstile).toHaveBeenCalledTimes(1);
    expect(getSubmitButton()).toBeDisabled();

    await user.type(screen.getByLabelText("Nome"), "Novo contato");

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("bloqueia novos envios e mantém os campos enquanto aguarda a resposta", async () => {
    let resolveRequest;

    vi.mocked(sendContact).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<Contact />);

    await fillForm(user);
    await completeVerification(user);
    await user.click(getSubmitButton());

    const sendingButton = await screen.findByRole("button", {
      name: "Enviando...",
    });

    expect(sendingButton).toBeDisabled();

    for (const label of ["Nome", "E-mail", "Mensagem"]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("readonly");
    }

    expect(screen.getByLabelText("Mensagem")).toHaveValue(validContact.message);

    await user.click(sendingButton);

    expect(sendContact).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest({ success: true });
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Sua mensagem foi aceita para envio.",
      );
    });

    expect(screen.getByLabelText("Nome")).not.toHaveAttribute("readonly");
  });

  it("preserva os campos após erro e permite tentar novamente com nova verificação", async () => {
    vi.mocked(sendContact).mockRejectedValueOnce(
      new Error("Não foi possível enviar sua mensagem."),
    );

    const user = userEvent.setup();
    render(<Contact />);

    await fillForm(user);
    await completeVerification(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Não foi possível enviar sua mensagem.",
      );
    });

    expect(screen.getByLabelText("Nome")).toHaveValue(validContact.name);
    expect(screen.getByLabelText("E-mail")).toHaveValue(validContact.email);
    expect(screen.getByLabelText("Mensagem")).toHaveValue(validContact.message);

    expect(resetTurnstile).toHaveBeenCalledTimes(1);
    expect(getSubmitButton()).toBeDisabled();

    await completeVerification(user);
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Sua mensagem foi aceita para envio.",
      );
    });

    expect(sendContact).toHaveBeenCalledTimes(2);
    expect(resetTurnstile).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText("Mensagem")).toHaveValue("");
  });

  it("bloqueia novamente o envio quando a verificação expira", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await completeVerification(user);

    expect(getSubmitButton()).toBeEnabled();

    await user.click(
      screen.getByRole("button", {
        name: "Simular verificação expirada",
      }),
    );

    expect(getSubmitButton()).toBeDisabled();
    expect(sendContact).not.toHaveBeenCalled();
  });

  it("informa falha na verificação e mantém o envio bloqueado", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await completeVerification(user);

    await user.click(
      screen.getByRole("button", {
        name: "Simular erro de verificação",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar a verificação.",
    );

    expect(getSubmitButton()).toBeDisabled();
    expect(sendContact).not.toHaveBeenCalled();

    await completeVerification(user);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();
  });

  it("informa indisponibilidade quando a chave pública não está configurada", () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");

    render(<Contact />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O formulário está temporariamente indisponível.",
    );

    expect(
      screen.queryByRole("button", {
        name: "Simular verificação concluída",
      }),
    ).not.toBeInTheDocument();
    expect(getSubmitButton()).toBeDisabled();
    expect(sendContact).not.toHaveBeenCalled();
  });
});
