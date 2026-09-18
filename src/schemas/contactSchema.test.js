import { describe, expect, it } from "vitest";
import { contactSchema } from "./contactSchema";

const valid = {
  name: "Agnaldo",
  email: "agnaldo@example.com",
  message: "Quero conversar sobre um projeto.",
};

describe("Validação de contato", () => {
  it("normaliza espaços sem alterar o conteúdo da mensagem", () => {
    expect(
      contactSchema.parse({
        name: "  Agnaldo  ",
        email: " agnaldo@example.com ",
        message: "  Olá, tudo bem?  ",
      }),
    ).toEqual({
      name: "Agnaldo",
      email: "agnaldo@example.com",
      message: "Olá, tudo bem?",
    });
  });

  it.each([
    ["name", ""],
    ["name", "   "],
    ["name", "A"],
    ["name", "a".repeat(101)],
    ["email", ""],
    ["email", "email-invalido"],
    ["message", "curta"],
    ["message", " ".repeat(20)],
    ["message", "a".repeat(2001)],
  ])("rejeita %s inválido (%s)", (field, value) => {
    const result = contactSchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(
      true,
    );
  });

  it("aceita os limites de nome e mensagem", () => {
    expect(
      contactSchema.safeParse({
        ...valid,
        name: "a".repeat(100),
        message: "a".repeat(2000),
      }).success,
    ).toBe(true);
  });

  it("rejeita os campos vazios", () => {
    const resultado = contactSchema.safeParse({
      name: "",
      email: "",
      message: "",
    });

    expect(resultado.success).toBe(false);

    const camposComErro = resultado.error.issues.map((erro) => erro.path[0]);

    expect(camposComErro).toEqual(
      expect.arrayContaining(["name", "email", "message"]),
    );
  });

  it.each([
    ["name", "A"],
    ["name", "A".repeat(101)],
    ["message", "Olá"],
    ["message", "A".repeat(2001)],
  ])("rejeita tamanho inválido no campo %s", (campo, valor) => {
    const dados = {
      name: "Agnaldo Korb",
      email: "agnaldo@example.com",
      message: "Gostaria de conversar sobre um projeto.",
    };

    const resultado = contactSchema.safeParse({
      ...dados,
      [campo]: valor,
    });

    expect(resultado.success).toBe(false);

    expect(resultado.error.issues.some((erro) => erro.path[0] === campo)).toBe(
      true,
    );
  });

  it.each([
    [2, 10],
    [100, 2000],
  ])(
    "aceita nome com %i e mensagem com %i caracteres",
    (tamanhoNome, tamanhoMensagem) => {
      const resultado = contactSchema.safeParse({
        name: "A".repeat(tamanhoNome),
        email: "agnaldo@example.com",
        message: "B".repeat(tamanhoMensagem),
      });

      expect(resultado.success).toBe(true);
    },
  );

  it("remove espaços no início e no fim dos campos", () => {
    const resultado = contactSchema.safeParse({
      name: "  Agnaldo Korb  ",
      email: "  agnaldo@example.com  ",
      message: "  Quero conversar sobre um projeto.  ",
    });

    expect(resultado.success).toBe(true);

    expect(resultado.data).toEqual({
      name: "Agnaldo Korb",
      email: "agnaldo@example.com",
      message: "Quero conversar sobre um projeto.",
    });
  });

  it("rejeita campos preenchidos somente com espaços", () => {
    const resultado = contactSchema.safeParse({
      name: "     ",
      email: "     ",
      message: "                    ",
    });

    expect(resultado.success).toBe(false);

    const camposComErro = resultado.error.issues.map((erro) => erro.path[0]);

    expect(camposComErro).toEqual(
      expect.arrayContaining(["name", "email", "message"]),
    );
  });
});
