import { describe, expect, it } from "vitest";
import { amounToCents, calculateSummary } from "./finance";
import type { Transaction } from "../types/transaction";

const transactions: Transaction[] = [
  {
    id: 1,
    description: "Salário",
    amount: "5000.00",
    type: "receita",
    category_id: 1,
    category_name: "Salário",
    date: "2026-10-20",
  },
  {
    id: 2,
    description: "Supermercado",
    amount: "800.00",
    type: "despesa",
    category_id: 5,
    category_name: "Alimentação",
    date: "2026-10-25",
  },
  {
    id: 3,
    description: "Aluguel futuro",
    amount: "1200.00",
    type: "despesa",
    category_id: 6,
    category_name: "Moradia",
    date: "2026-10-30",
  },
  {
    id: 4,
    description: "Freelance futuro",
    amount: "700.00",
    type: "receita",
    category_id: 2,
    category_name: "Freelance",
    date: "2026-11-05",
  },
  {
    id: 5,
    description: "Despesa anterior",
    amount: "300.00",
    type: "despesa",
    category_id: 5,
    category_name: "Alimentação",
    date: "2026-09-28",
  },
];

describe("amounToCents", () => {
    it("converte valores decimais para centavos", () => {
        expect(amounToCents("185.90")).toBe(18590);
        expect(amounToCents("0.50")).toBe(50);
        expect(amounToCents("125")).toBe(12500);
    });

    it("preserva centavos sem erro de ponto flutuante", () => {
        expect(amounToCents("0.10")).toBe(10);
        expect(amounToCents("0.20")).toBe(20);
    });
});

describe("calculateSummary", () => {
    it("calcula receitas, despesas e saldo do período", () => {
        const result = calculateSummary(
            transactions,
            "2026-10-29"
        );

        expect(result).toEqual({
            income: 5000,
            expense: 800,
            balance: 4200,
        });
    });

    it("ignora movimentações futuras do mesmo mês", () => {
        const result = calculateSummary(
            transactions,
            "2026-10-29"
        );

        expect(result.expense).toBe(800);
    });

    it("inclui uma movimentação quando sua data chega", () => {
        const result = calculateSummary(
            transactions,
            "2026-10-30"
        );

        expect(result.expense).toBe(2000);
        expect(result.balance).toBe(3000);
    });

    it("ignora movimentações de meses diferentes", () => {
        const result = calculateSummary(
            transactions,
            "2026-10-29"
        );

        expect(result.income).toBe(5000);
        expect(result.expense).toBe(800);
    });

    it("retorna valores zerados quando não há movimentações", () => {
        const result = calculateSummary([], "2026-10-29");

        expect(result).toEqual({
            income: 0,
            expense: 0,
            balance: 0,
        });
    });

    it("calcula corretamente valores com centavos", () => {
        const decimalTransactions: Transaction[] = [
            {
                ...transactions[0],
                amount: "0.10",
            },
            {
                ...transactions[0],
                id: 6,
                amount: "0.20",
            },
        ];

        const result = calculateSummary(
            decimalTransactions,
            "2026-10-29"
        );

        expect(result.income).toBeCloseTo(0.30, 2);
    });
});
