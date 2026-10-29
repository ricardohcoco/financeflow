import assert from "node:assert/strict";
import test from "node:test";
import { registerSchema } from "../schemas/authSchema.js";

test("aceita um cadastro válido", () => {
    const result = registerSchema.safeParse({
        name: "Usuario Teste",
        email: " TESTE@EMAIL.COM ",
        password: "senhaSegura123",
    });

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(result.data.email, "teste@email.com");
    }
});

test("rejeita nome muito curto", () => {
  const result = registerSchema.safeParse({
    name: "AB",
    email: "teste@email.com",
    password: "senhaSegura123",
  });

  assert.equal(result.success, false);
});

test("rejeita e-mail inválido", () => {
    const result = registerSchema.safeParse({
        name: "Usuário Teste",
        email: "email-invalido",
        password: "senhaSegura123",
    });

    assert.equal(result.success, false);
});

test("rejeita senha muito curta", () => {
  const result = registerSchema.safeParse({
    name: "Usuario Teste",
    email: "teste@email.com",
    password: "12345",
  });

  assert.equal(result.success, false);
});

test("rejeita senha com mais de 72 bytes", () => {
    const result = registerSchema.safeParse({
        name: "Usuário Teste",
        email: "teste@email.com",
        password: "a".repeat(73),
    });

    assert.equal(result.success, false);
})