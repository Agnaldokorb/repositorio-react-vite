import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import Education from "./Education";
import { getCourses } from "@/services/coursesService";
import { completedCourse, ongoingCourse } from "@/test/courseFixtures";

vi.mock("@/services/coursesService", () => ({
  getCourses: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getCourses).mockReset();
});

describe("Página Formação", () => {
  it("separa os cursos em andamento dos concluídos", async () => {
    vi.mocked(getCourses).mockResolvedValue([completedCourse, ongoingCourse]);

    render(<Education />);

    const ongoingSection = await screen.findByRole("region", {
      name: "Em formação",
    });

    const completedSection = screen.getByRole("region", {
      name: "Concluídos",
    });

    expect(
      within(ongoingSection).getByRole("heading", {
        name: ongoingCourse.title,
      }),
    ).toBeInTheDocument();

    expect(
      within(ongoingSection).queryByRole("heading", {
        name: completedCourse.title,
      }),
    ).not.toBeInTheDocument();

    expect(
      within(completedSection).getByRole("heading", {
        name: completedCourse.title,
      }),
    ).toBeInTheDocument();

    expect(
      within(completedSection).queryByRole("heading", {
        name: ongoingCourse.title,
      }),
    ).not.toBeInTheDocument();

    expect(within(ongoingSection).queryByRole("img")).not.toBeInTheDocument();
    expect(within(completedSection).getByRole("img")).toBeInTheDocument();
  });

  it("distingue carregamento de lista vazia", async () => {
    let resolveRequest;

    vi.mocked(getCourses).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<Education />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando formação...",
    );
    expect(
      screen.queryByText("Minha formação será publicada em breve."),
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveRequest([]);
    });

    expect(
      screen.getByText("Minha formação será publicada em breve."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("distingue erro de consulta de lista vazia", async () => {
    vi.mocked(getCourses).mockRejectedValue(new Error("Offline"));

    render(<Education />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar minha formação.",
    );
    expect(
      screen.queryByText("Minha formação será publicada em breve."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("informa quando não há cursos em andamento", async () => {
    vi.mocked(getCourses).mockResolvedValue([completedCourse]);

    render(<Education />);

    expect(
      await screen.findByText(
        "Nenhuma formação em andamento publicada no momento.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: completedCourse.title }),
    ).toBeInTheDocument();
  });

  it("informa quando não há cursos concluídos", async () => {
    vi.mocked(getCourses).mockResolvedValue([ongoingCourse]);

    render(<Education />);

    expect(
      await screen.findByText("Nenhum curso concluído publicado no momento."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: ongoingCourse.title }),
    ).toBeInTheDocument();
  });
});
