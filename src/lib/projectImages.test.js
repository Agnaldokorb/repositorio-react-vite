import { describe, expect, it } from "vitest";
import { getProjectImageUrl } from "./projectImages";

describe("Endereço das imagens dos projetos", () => {
  it("aceita um link HTTPS do GitHub", () => {
    const url =
      "https://raw.githubusercontent.com/Agnaldokorb/repositorio-react-vite/main/capa.webp";

    expect(getProjectImageUrl(url)).toBe(url);
  });

  it("preserva os parâmetros da URL do avatar", () => {
    const url = "https://avatars.githubusercontent.com/u/103047820?v=4";

    expect(getProjectImageUrl(url)).toBe(url);
  });

  it.each([null, undefined, "", "   "])(
    "retorna null quando não há endereço válido: %s",
    (value) => {
      expect(getProjectImageUrl(value)).toBeNull();
    },
  );

  it.each([
    "imagem.webp",
    "isso não é uma URL",
    "http://example.com/capa.webp",
    "javascript:alert(1)",
    "data:image/png;base64,abc",
  ])("rejeita endereço inválido ou sem HTTPS: %s", (value) => {
    expect(getProjectImageUrl(value)).toBeNull();
  });
});
