import type { Transaction, TransactionFormData } from "../types/transaction";
import { apiRequest } from "./api";

type TransactionsResponse = {
  transactions: Transaction[];
};

export async function getTransactions(
  token: string,
  signal?: AbortSignal,
): Promise<Transaction[]> {
  const response = await apiRequest<TransactionsResponse>("/transactions", {
    token,
    signal,
  });

  return response.transactions;
}

export function createTransaction(
  data: TransactionFormData,
  token: string,
): Promise<TransactionsResponse> {
  return apiRequest<TransactionsResponse>("/transactions", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateTransaction(
  id: number,
  data: TransactionFormData,
  token: string,
): Promise<TransactionsResponse> {
  return apiRequest<TransactionsResponse>(`/transactions/${id}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteTransaction(id: number, token: string): Promise<void> {
  return apiRequest<void>(`/transactions/${id}`, {
    method: "DELETE",
    token,
  });
}
