import { z } from "zod";

const amountSchema = z
    .string()
    .regex(
        /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
        "Informe um valor válido com até duas casas decimais."
    )
    .refine(
        (value) => Number(value) > 0,
        "O valor deve ser maior que zero."
    );

const dateSchema = z.iso.date();

export const transactionSchema = z.object({
    description: z
        .string()
        .trim()
        .min(1, "A descrição é obrigatória.")
        .max(200, "A descrição deve ter no máximo 200 caracteres."),
    
    amount: amountSchema,

    type: z.enum(["receita", "despesa"]),

    category_id: z
        .number()
        .int()
        .positive("Selecione uma categoria válida."),

    date: dateSchema,
}).strict();

export type TransactionInput = z.infer<
    typeof transactionSchema
>;

export const transactionFilterSchema = z.object({
    type: z.enum(["receita", "despesa"]).optional(),

    category_id: z.coerce.number()
        .int()
        .positive()
        .optional(),

    month: z
        .string()
        .regex(
            /^\d{4}-(0[1-9]|1[0-2])$/,
            "Informe o mês no formato YYYY-MM."
        )
        .optional(),
}).strict();

export type TransactionFilters = z.infer<
    typeof transactionFilterSchema
>;

export const transactionIdSchema = z.coerce
    .number()
    .int()
    .positive()
    .safe()
    .max(2147483647, "ID fora do intervalo permitido.");


export const updateTransactionSchema = transactionSchema;

export type UpdateTransactionInput = z.infer<
    typeof updateTransactionSchema
>;