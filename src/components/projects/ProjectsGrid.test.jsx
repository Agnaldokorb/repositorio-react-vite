import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import ProjectsGrid from "./ProjectsGrid";
import { project } from "@/test/fixtures";

function renderGrid(props = {}) {
  return render(
    <MemoryRouter>
      <ProjectsGrid projects={[]} loading={false} error="" {...props} />
    </MemoryRouter>,
  );
}

describe("Grade de projetos", () => {
  it("mostra carregamento sem apresentar lista vazia", () => {
    renderGrid({ loading: true });

    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument();

    expect(
      screen.queryByText("Novos projetos serão publicados em breve."),
    ).not.toBeInTheDocument();

    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("mostra a falha sem apresentar cartões antigos", () => {
    renderGrid({
      projects: [project],
      error: "Não foi possível carregar os projetos.",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os projetos.",
    );

    expect(screen.queryByRole("article")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Novos projetos serão publicados em breve."),
    ).not.toBeInTheDocument();
  });

  it("mostra a mensagem padrão quando não existem projetos", () => {
    renderGrid();

    expect(
      screen.getByText("Novos projetos serão publicados em breve."),
    ).toBeInTheDocument();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("permite uma mensagem específica para os destaques", () => {
    renderGrid({
      emptyMessage: "Novos destaques serão publicados em breve.",
    });

    expect(
      screen.getByText("Novos destaques serão publicados em breve."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Novos projetos serão publicados em breve."),
    ).not.toBeInTheDocument();
  });

  it("exibe um cartão e um link correto para cada projeto", () => {
    const segundoProjeto = {
      ...project,
      id: "project-2",
      slug: "segundo-projeto",
      title: "Segundo projeto",
    };

    renderGrid({
      projects: [project, segundoProjeto],
    });

    expect(screen.getAllByRole("article")).toHaveLength(2);

    expect(
      screen.getByRole("link", {
        name: `Ver projeto: ${project.title}`,
      }),
    ).toHaveAttribute("href", `/projetos/${project.slug}`);

    expect(
      screen.getByRole("link", {
        name: "Ver projeto: Segundo projeto",
      }),
    ).toHaveAttribute("href", "/projetos/segundo-projeto");
  });
});
