import type { Transaction } from "../types/transaction";

export function getLocalDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getCurrentMonth(): string {
    return getLocalDate().slice(0, 7);
}

export function amounToCents(amount: string): number {
    const [integer, decimal = ""] = amount.split(".");

    return (
        Number(integer) * 100 +
        Number(decimal.padEnd(2, "0"))
    );
}

export function calculateSummary(
    transactions: Transaction[],
    referenceDate: string
) {
    const month = referenceDate.slice(0, 7);

    const currentTransactions = transactions.filter(
        (transaction) =>
            transaction.date.startsWith(month) &&
        transaction.date <= referenceDate
    );

    const incomeCents = currentTransactions
    .filter((transaction) => transaction.type === "receita")
    .reduce(
        (total, transaction) =>
            total + amounToCents(transaction.amount),
        0
    );

    const expenseCents = currentTransactions
    .filter((transaction) => transaction.type === "despesa")
    .reduce(
        (total, transaction) =>
            total + amounToCents(transaction.amount),
        0
    );

    return {
        income: incomeCents / 100,
        expense: expenseCents / 100,
        balance: (incomeCents - expenseCents) / 100,
    };
}