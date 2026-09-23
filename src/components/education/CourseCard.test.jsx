import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CourseCard from "./CourseCard";
import { completedCourse, ongoingCourse } from "@/test/courseFixtures";

describe("Card de formação", () => {
  it("apresenta curso concluído e acesso ao certificado", () => {
    render(<CourseCard course={completedCourse} />);

    expect(
      screen.getByRole("heading", { name: completedCourse.title }),
    ).toBeInTheDocument();

    expect(screen.getByText(completedCourse.institution)).toBeInTheDocument();
    expect(screen.getByText(completedCourse.description)).toBeInTheDocument();
    expect(screen.getByText("Concluído")).toBeInTheDocument();
    expect(screen.getByText("40 horas")).toBeInTheDocument();
    expect(screen.getByText("Concluído em agosto de 2026")).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: `Certificado de conclusão de ${completedCourse.title}`,
      }),
    ).toHaveAttribute("src", completedCourse.certificate_image_url);

    const link = screen.getByRole("link", {
      name: `Ampliar certificado de ${completedCourse.title} (abre em nova aba)`,
    });

    expect(link).toHaveAttribute("href", completedCourse.certificate_image_url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("não apresenta certificado ou conclusão em curso em andamento", () => {
    render(
      <CourseCard
        course={{
          ...ongoingCourse,
          // Mesmo recebendo dados inconsistentes, não deve exibi-los.
          completed_at: completedCourse.completed_at,
          certificate_image_url: completedCourse.certificate_image_url,
        }}
      />,
    );

    expect(screen.getByText("Em formação")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/Concluído em/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Certificado ainda/)).not.toBeInTheDocument();
  });

  it.each([
    ["ausente", null],
    ["vazio", ""],
    ["inválido", "certificado.webp"],
    ["HTTP", "http://example.com/certificado.webp"],
    ["JavaScript", "javascript:alert(1)"],
    ["com credenciais", "https://usuario:senha@example.com/certificado.webp"],
  ])("mostra alternativa para certificado %s", (_description, url) => {
    render(
      <CourseCard
        course={{ ...completedCourse, certificate_image_url: url }}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByText("Certificado ainda não disponível."),
    ).toBeInTheDocument();
  });

  it("aceita espaços nas extremidades do endereço", () => {
    render(
      <CourseCard
        course={{
          ...completedCourse,
          certificate_image_url: "  https://example.com/certificado.webp  ",
        }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/certificado.webp",
    );
  });

  it("trata imagem quebrada e permite carregar um novo endereço", () => {
    const { rerender } = render(<CourseCard course={completedCourse} />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível carregar o certificado."),
    ).toBeInTheDocument();

    rerender(
      <CourseCard
        course={{
          ...completedCourse,
          certificate_image_url: "https://example.com/novo.webp",
        }}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/novo.webp",
    );
  });

  it.each([null, "data-invalida"])(
    "omite data ausente ou inválida: %s",
    (date) => {
      render(
        <CourseCard
          course={{
            ...completedCourse,
            completed_at: date,
            workload_hours: null,
          }}
        />,
      );

      expect(screen.queryByText(/Concluído em/)).not.toBeInTheDocument();
      expect(screen.queryByText(/horas/)).not.toBeInTheDocument();
      expect(screen.getByText("Concluído")).toBeInTheDocument();
    },
  );
});
