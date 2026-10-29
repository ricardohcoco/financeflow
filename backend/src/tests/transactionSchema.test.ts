import assert from "node:assert/strict";
import test from "node:test";
import { transactionSchema, } from "../schemas/transactionSchema.js";

const validTransaction = {
    description: "Supermercado",
    amount: "185.90",
    type: "despesa",
    category_id: 5,
    date: "2026-10-20",
};

test("aceita uma movimentação válida", () => {
    const result = transactionSchema.safeParse(validTransaction);

    assert.equal(result.success, true);
});

test("rejeita valor negativo", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        amount: "-100.00",
    });

    assert.equal(result.success, false);
});

test("rejeita mais de duas casas decimais", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        amount: "100.999",
    });

    assert.equal(result.success, false);
});

test("rejeita tipo inválido", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        type: "transferencia",
    });

    assert.equal(result.success, false);
});

test("rejeita categoria inválida", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        category_id: -1,
    });

    assert.equal(result.success, false);
});

test("rejeita data inexistente", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        date: "2026-02-30",
    });

    assert.equal(result.success, false);
});

test("rejeita tentativa de enviar user_id", () => {
    const result = transactionSchema.safeParse({
        ...validTransaction,
        user_id: 999,
    });

    assert.equal(result.success, false);
});