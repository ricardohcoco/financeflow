
import test from "node:test";
import assert from "node:assert/strict";
import { getErrorCode, isDatabaseUnavailable, } from "../errors/databaseError.js";

test("identifica conexão recusada", () => {
  const error = { code: "ECONNREFUSED" };

  assert.equal(isDatabaseUnavailable(error), true);
});

test("identifica falha de conexão PostgreSQL", () => {
  const error = { code: "08006" };

  assert.equal(isDatabaseUnavailable(error), true);
});

test("identifica banco temporariamente indisponível", () => {
  const error = { code: "57P03" };

  assert.equal(isDatabaseUnavailable(error), true);
});

test("não confunde erro SQL com indisponibilidade", () => {
  const error = { code: "42P08" };

  assert.equal(isDatabaseUnavailable(error), false);
});

test("não confunde tabela inexistente com indisponibilidade", () => {
  const error = { code: "42P01" };

  assert.equal(isDatabaseUnavailable(error), false);
});

test("trata erros sem código", () => {
  assert.equal(getErrorCode(new Error("Falha")), "UNKNOWN");
  assert.equal(isDatabaseUnavailable(new Error("Falha")), false);
});
