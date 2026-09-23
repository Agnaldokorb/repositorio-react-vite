import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectPreviewLink from "./ProjectPreviewLink";

describe("Link de preview do projeto", () => {
  it("mostra o endereço publicado e informa a abertura em nova aba", () => {
    render(
      <ProjectPreviewLink
        url="https://agnaldo.dev.br/"
        title="Portfólio Agnaldo Korb"
      />,
    );

    const link = screen.getByRole("link", {
      name: "Ver projeto online: Portfólio Agnaldo Korb (abre em nova aba)",
    });

    expect(link).toHaveTextContent("Ver projeto online");
    expect(link).toHaveAttribute("href", "https://agnaldo.dev.br/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("aceita um endereço com espaços nas extremidades", () => {
    render(
      <ProjectPreviewLink
        url="  https://agnaldo.dev.br/projetos  "
        title="Portfólio"
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://agnaldo.dev.br/projetos",
    );
  });

  it.each([
    ["ausente", undefined],
    ["nulo", null],
    ["vazio", ""],
    ["somente espaços", "   "],
    ["valor numérico", 123],
    ["endereço inválido", "endereco-invalido"],
    ["caminho relativo", "/projetos"],
    ["HTTP", "http://example.com"],
    ["JavaScript", "javascript:alert(1)"],
    ["credenciais no endereço", "https://usuario:senha@example.com"],
  ])("não mostra o botão com endereço %s", (_description, url) => {
    render(<ProjectPreviewLink url={url} title="Portfólio" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
