import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App";
import { getProjects } from "@/services/projectsService";
import { project } from "@/test/fixtures";
import { mockMatchMedia } from "@/test/browser";

vi.mock("@/components/layout/SiteBackground", () => ({
  default: () => null,
}));

vi.mock("@/services/projectsService", () => ({ getProjects: vi.fn() }));

let changeMedia;
beforeEach(() => {
  changeMedia = mockMatchMedia();
  vi.mocked(getProjects).mockReset().mockResolvedValue([project]);
});
afterEach(() => vi.unstubAllGlobals());

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Navegação e páginas integradas", () => {
  it("mantém o preview do projeto ao navegar do card aos detalhes", async () => {
    const user = userEvent.setup();

    vi.mocked(getProjects).mockResolvedValue([
      {
        ...project,
        preview_url: "https://example.com/demo",
      },
    ]);

    renderApp("/projetos");

    expect(
      await screen.findByRole("link", { name: /Ver projeto online:/ }),
    ).toHaveAttribute("href", "https://example.com/demo");

    await user.click(screen.getByRole("link", { name: /Ver projeto:/ }));

    await screen.findByRole("heading", {
      level: 1,
      name: project.title,
    });

    expect(
      screen.getByRole("link", { name: /Ver projeto online:/ }),
    ).toHaveAttribute("href", "https://example.com/demo");
  });

  it("não apresenta preview nos detalhes quando não há endereço", async () => {
    vi.mocked(getProjects).mockResolvedValue([
      {
        ...project,
        preview_url: null,
      },
    ]);

    renderApp(`/projetos/${project.slug}`);

    await screen.findByRole("heading", {
      level: 1,
      name: project.title,
    });

    expect(
      screen.queryByRole("link", { name: /Ver projeto online:/ }),
    ).not.toBeInTheDocument();
  });

  it("mostra a galeria somente nos detalhes do projeto", async () => {
    const user = userEvent.setup();

    vi.mocked(getProjects).mockResolvedValue([
      {
        ...project,
        gallery_images: [
          {
            src: "https://example.com/tela.webp",
            label: "Página inicial",
            alt: "Tela inicial do projeto",
          },
        ],
      },
    ]);

    renderApp("/projetos");

    const detailsLink = await screen.findByRole("link", {
      name: /Ver projeto:/,
    });

    expect(
      screen.queryByRole("region", { name: "Galeria do projeto" }),
    ).not.toBeInTheDocument();

    await user.click(detailsLink);

    expect(
      await screen.findByRole("img", {
        name: "Tela inicial do projeto",
      }),
    ).toHaveAttribute("src", "https://example.com/tela.webp");

    await user.click(screen.getByRole("link", { name: "Voltar aos projetos" }));

    await screen.findByRole("heading", {
      level: 1,
      name: "Meus projetos",
    });

    expect(
      screen.queryByRole("region", { name: "Galeria do projeto" }),
    ).not.toBeInTheDocument();
  });

  it("navega da listagem aos detalhes e retorna", async () => {
    const user = userEvent.setup();
    renderApp("/projetos");
    await user.click(await screen.findByRole("link", { name: /Ver projeto:/ }));
    expect(
      await screen.findByRole("heading", { level: 1, name: project.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(project.description)).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Voltar aos projetos" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Meus projetos" }),
    ).toBeInTheDocument();
  });

  it.each(["/rota-inexistente", "/projetos/inexistente"])(
    "trata endereço inexistente: %s",
    async (path) => {
      renderApp(path);
      expect(
        await screen.findByRole("heading", { name: "Página não encontrada" }),
      ).toBeInTheDocument();
    },
  );

  it("limita destaques a três e exclui projetos sem destaque", async () => {
    vi.mocked(getProjects).mockResolvedValue([
      { ...project, id: "normal", title: "Sem destaque", featured: false },
      ...[1, 2, 3, 4].map((id) => ({
        ...project,
        id: String(id),
        slug: "projeto-" + id,
        title: "Destaque " + id,
      })),
    ]);
    renderApp();
    expect(
      await screen.findByRole("link", { name: "Ver projeto: Destaque 1" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver projeto:/ })).toHaveLength(
      3,
    );
    expect(
      screen.queryByRole("link", { name: "Ver projeto: Sem destaque" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ver projeto: Destaque 4" }),
    ).not.toBeInTheDocument();
  });

  it("distingue carregamento de lista vazia", async () => {
    let resolveRequest;
    vi.mocked(getProjects).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    renderApp("/projetos");
    expect(
      await screen.findByText("Carregando projetos..."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Novos projetos serão publicados em breve."),
    ).not.toBeInTheDocument();
    await act(async () => resolveRequest([]));
    expect(
      await screen.findByText("Novos projetos serão publicados em breve."),
    ).toBeInTheDocument();
  });

  it("não confunde falha de rede com projeto inexistente", async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error("Offline"));
    renderApp("/projetos/portfolio");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar",
    );
    expect(screen.queryByText("Página não encontrada")).not.toBeInTheDocument();
  });

  it("abre menu lateral, navega e fecha após escolher uma página", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(
      screen.getByRole("button", { name: "Abrir menu de navegação" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("link", { name: "Contato" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Vamos conversar?",
      }),
    ).toBeInTheDocument();
  });

  it("fecha menu com Escape e devolve foco ao botão", async () => {
    const user = userEvent.setup();
    renderApp();
    const trigger = screen.getByRole("button", {
      name: "Abrir menu de navegação",
    });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("fecha menu ao receber a mudança para desktop", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menu de navegação",
      }),
    );

    await screen.findByRole("dialog");

    act(() => changeMedia("(min-width: 768px)", true));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
