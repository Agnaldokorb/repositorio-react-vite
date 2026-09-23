import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCourses } from "./useCourses";
import { getCourses } from "@/services/coursesService";
import { completedCourse } from "@/test/courseFixtures";

vi.mock("@/services/coursesService", () => ({
  getCourses: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getCourses).mockReset();
});

describe("Consulta de formação", () => {
  it("começa carregando e entrega os cursos recebidos", async () => {
    vi.mocked(getCourses).mockResolvedValue([completedCourse]);

    const { result } = renderHook(() => useCourses());

    expect(result.current.loading).toBe(true);
    expect(result.current.courses).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.courses).toEqual([completedCourse]);
    expect(result.current.error).toBe("");
  });

  it("apresenta mensagem compreensível quando a consulta falha", async () => {
    vi.mocked(getCourses).mockRejectedValue(new Error("Offline"));

    const { result } = renderHook(() => useCourses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Não foi possível carregar minha formação. Tente novamente mais tarde.",
    );
    expect(result.current.courses).toEqual([]);
  });

  it.each(["sucesso", "erro"])(
    "cancela ao desmontar e ignora resposta tardia de %s",
    async (outcome) => {
      let resolveRequest;
      let rejectRequest;

      vi.mocked(getCourses).mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            resolveRequest = resolve;
            rejectRequest = reject;
          }),
      );

      const { result, unmount } = renderHook(() => useCourses());
      const signal = vi.mocked(getCourses).mock.calls[0][0];
      const previousState = result.current;

      expect(signal.aborted).toBe(false);

      unmount();

      expect(signal.aborted).toBe(true);

      await act(async () => {
        if (outcome === "sucesso") {
          resolveRequest([completedCourse]);
        } else {
          rejectRequest(new Error("Resposta tardia"));
        }
      });

      expect(result.current).toBe(previousState);
    },
  );
});
