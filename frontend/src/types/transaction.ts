export type TransactionType = "receita" | "despesa";

export type Transaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    category_id: number;
    category_name: string;
    date: string;
};

export type TransactionFormData = {
    description: string;
    amount: string;
    type: TransactionType;
    category_id: number;
    date: string;
};