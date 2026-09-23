import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import ProjectGallery from "./ProjectGallery";
import { mockMatchMedia } from "@/test/browser";

// Substitui apenas a renderização WebGL.
// O preparo dos dados e a escolha do modo continuam reais.
vi.mock("@/components/ui/circular-gallery-2", () => ({
  CircularGallery: ({ items }) => (
    <div role="group" aria-label="Galeria circular simulada">
      {items.map((item) => (
        <img key={item.image} src={item.image} alt={item.alt} />
      ))}
    </div>
  ),
}));

const images = [
  {
    src: "https://example.com/inicio.webp",
    label: "Início",
    alt: "Tela inicial",
  },
  {
    src: "https://example.com/contato.webp",
    label: "Contato",
    alt: "Tela de contato",
  },
];

let changeMedia;

beforeEach(() => {
  changeMedia = mockMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Galeria do projeto", () => {
  it.each([
    ["ausentes", undefined],
    ["nulas", null],
    ["vazias", []],
    ["em formato incorreto", "imagem.webp"],
  ])("não mostra a seção com imagens %s", (_description, value) => {
    render(<ProjectGallery images={value} />);

    expect(
      screen.queryByRole("region", { name: "Galeria do projeto" }),
    ).not.toBeInTheDocument();
  });

  it("descarta entradas inválidas e preserva a imagem válida", () => {
    render(
      <ProjectGallery
        images={[
          null,
          {},
          { src: 123 },
          { src: "imagem.webp" },
          { src: "http://example.com/imagem.webp" },
          { src: "javascript:alert(1)" },
          images[0],
        ]}
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(1);

    expect(screen.getByRole("img", { name: "Tela inicial" })).toHaveAttribute(
      "src",
      images[0].src,
    );
  });

  it("mostra uma imagem sem ativar a galeria circular", () => {
    render(<ProjectGallery images={[images[0]]} />);

    expect(
      screen.getByRole("img", { name: "Tela inicial" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("group", {
        name: "Galeria circular simulada",
      }),
    ).not.toBeInTheDocument();
  });

  it("carrega a galeria circular com várias imagens", async () => {
    render(<ProjectGallery images={images} />);

    expect(
      await screen.findByRole("group", {
        name: "Galeria circular simulada",
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("usa imagens estáticas quando o usuário prefere movimento reduzido", () => {
    changeMedia("(prefers-reduced-motion: reduce)", true);

    render(<ProjectGallery images={images} />);

    expect(screen.getAllByRole("img")).toHaveLength(2);

    expect(
      screen.queryByRole("group", {
        name: "Galeria circular simulada",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Contato")).toBeInTheDocument();
  });

  it("responde à mudança da preferência de movimento", async () => {
    render(<ProjectGallery images={images} />);

    await screen.findByRole("group", {
      name: "Galeria circular simulada",
    });

    act(() => {
      changeMedia("(prefers-reduced-motion: reduce)", true);
    });

    expect(
      screen.queryByRole("group", {
        name: "Galeria circular simulada",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Início")).toBeInTheDocument();
  });

  it("remove espaços do endereço e fornece uma descrição alternativa", () => {
    render(
      <ProjectGallery
        images={[
          {
            src: "  https://example.com/tela.webp  ",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Imagem 1 do projeto" }),
    ).toHaveAttribute("src", "https://example.com/tela.webp");

    expect(screen.getByText("Imagem 1")).toBeInTheDocument();
  });
});
