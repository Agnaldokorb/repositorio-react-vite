import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useProjects } from "./useProjects";
import { getProjects } from "@/services/projectsService";
import { project } from "@/test/fixtures";

vi.mock("@/services/projectsService", () => ({ getProjects: vi.fn() }));

beforeEach(() => {
  vi.mocked(getProjects).mockReset();
});

describe("Consulta de projetos", () => {
  it("começa carregando e entrega os dados recebidos", async () => {
    vi.mocked(getProjects).mockResolvedValue([project]);
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual([project]);
    expect(result.current.error).toBe("");
  });

  it("apresenta erro compreensível quando a consulta falha", async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("Não foi possível carregar");
    expect(result.current.projects).toEqual([]);
  });

  it("cancela a consulta ao sair da página e ignora resposta tardia", async () => {
    let resolveRequest;
    vi.mocked(getProjects).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const { result, unmount } = renderHook(() => useProjects());
    const signal = vi.mocked(getProjects).mock.calls[0][0];
    const previous = result.current;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => resolveRequest([project]));
    expect(result.current).toBe(previous);
  });
});
