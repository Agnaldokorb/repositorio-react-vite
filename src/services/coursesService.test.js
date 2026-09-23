import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCourses } from "./coursesService";
import { supabase } from "@/lib/supabase";
import { completedCourse } from "@/test/courseFixtures";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

let query;

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();

  query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockResolvedValue({
      data: [completedCourse],
      error: null,
    }),
  };

  vi.mocked(supabase.from).mockReturnValue(query);
});

describe("Serviço de formação", () => {
  it("consulta cursos publicados com os campos necessários", async () => {
    const signal = new AbortController().signal;

    await expect(getCourses(signal)).resolves.toEqual([completedCourse]);

    expect(supabase.from).toHaveBeenCalledWith("courses");
    expect(query.eq).toHaveBeenCalledWith("published", true);

    const fields = query.select.mock.calls[0][0]
      .split(",")
      .map((field) => field.trim());

    expect(fields).toEqual(
      expect.arrayContaining([
        "id",
        "title",
        "institution",
        "description",
        "status",
        "workload_hours",
        "completed_at",
        "certificate_image_url",
        "sort_order",
      ]),
    );
  });

  it("ordena por posição e usa o id como desempate", async () => {
    await getCourses(new AbortController().signal);

    expect(query.order).toHaveBeenNthCalledWith(1, "sort_order", {
      ascending: true,
    });

    expect(query.order).toHaveBeenNthCalledWith(2, "id", { ascending: true });
  });

  it("encaminha o sinal de cancelamento", async () => {
    const signal = new AbortController().signal;

    await getCourses(signal);

    expect(query.abortSignal).toHaveBeenCalledWith(signal);
  });

  it("retorna lista vazia quando não recebe dados", async () => {
    query.abortSignal.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(getCourses(new AbortController().signal)).resolves.toEqual([]);
  });

  it("propaga a falha da consulta", async () => {
    const error = new Error("Consulta indisponível");

    query.abortSignal.mockResolvedValue({
      data: null,
      error,
    });

    await expect(getCourses(new AbortController().signal)).rejects.toBe(error);
  });
});
