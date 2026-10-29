import { pool } from "../database/connection.js";
import type { TransactionInput } from "../schemas/transactionSchema.js";
import type { TransactionFilters } from "../schemas/transactionSchema.js";
import type { UpdateTransactionInput } from "../schemas/transactionSchema.js";

type CreatedTransaction = {
  id: number;
  user_id: number;
  category_id: number;
  description: string;
  amount: string;
  type: "receita" | "despesa";
  date: string;
  created_at: Date;
};

export async function createTransaction(
  data: TransactionInput,
  userId: number,
): Promise<CreatedTransaction | null> {
  const result = await pool.query<CreatedTransaction>(
    `INSERT INTO transactions (
         user_id,
         category_id,
         description,
         amount,
         type,
         date
        )
         SELECT $1, c.id, $3, $4, $5::varchar(10), $6
         FROM categories c
         WHERE c.id = $2
            AND c.type = $5
         RETURNING
            id,
            user_id,
            category_id,
            description,
            amount::text AS amount,
            type,
            date::text AS date,
            created_at`,
    [
      userId,
      data.category_id,
      data.description,
      data.amount,
      data.type,
      data.date,
    ],
  );

  return result.rows[0] ?? null;
}

type TransactionListItem = {
  id: number;
  description: string;
  amount: string;
  type: "receita" | "despesa";
  date: string;
  category_id: number;
  category_name: string;
  created_at: Date;
};

export async function listTransactions(
  userId: number,
  filters: TransactionFilters,
) {
  const values: (string | number)[] = [userId];

  let query = `
        SELECT
         t.id,
         t.description,
         t.amount::text AS amount,
         t.type,
         t.date::text AS date,
         t.category_id,
         c.name AS category_name,
         t.created_at
        FROM transactions t
        JOIN categories c
         ON c.id = t.category_id
        WHERE t.user_id = $1
    `;

  if (filters.type) {
    values.push(filters.type);
    query += ` AND t.type = $${values.length}`;
  }

  if (filters.category_id !== undefined) {
    values.push(filters.category_id);
    query += ` AND t.category_id = $${values.length}`;
  }

  if (filters.month) {
    const startDate = `${filters.month}-01`;
    values.push(startDate);

    query += `
            AND t.date >= $${values.length}::date
            AND t.date < ($${values.length}::date + INTERVAL '1 month')
        `;
  }

  query += " ORDER BY t.date DESC, t.id DESC";

  const result = await pool.query<TransactionListItem>(query, values);

  return result.rows;
}

export async function findTransactionById(
  transactionId: number,
  userId: number,
) {
  const result = await pool.query<{
    id: number;
    description: string;
    amount: string;
    type: "receita" | "despesa";
    date: string;
    category_id: number;
    category_name: string;
    created_at: Date;
  }>(
    `SELECT
          t.id,
          t.description,
          t.amount::text AS amount,
          t.type,
          t.date::text AS date,
          t.category_id,
          c.name AS category_name,
          t.created_at
        FROM transactions t
        JOIN categories c ON c.id = t.category_id
        WHERE t.id = $1
         AND t.user_id = $2`,
    [transactionId, userId],
  );

  return result.rows[0] ?? null;
}

export async function updateTransaction(
  transactionId: number,
  userId: number,
  data: UpdateTransactionInput,
) {
  const result = await pool.query<{
    id: number;
    description: string;
    amount: string;
    type: "receita" | "despesa";
    date: string;
    category: number;
  }>(
    `UPDATE transactions AS t
         SET 
            description = $3,
            amount = $4,
            type = $5::varchar(10),
            category_id = $6,
            date = $7
         WHERE t.id = $1
            AND t.user_id = $2
            AND EXISTS (
            SELECT 1
            FROM categories c
            WHERE c.id = $6
            AND c.type = $5::varchar(10)
         )
         RETURNING
            t.id,
            t.description,
            t.amount::text AS amount,
            t.type,
            t.date::text AS date,
            t.category_id`,
    [
      transactionId,
      userId,
      data.description,
      data.amount,
      data.type,
      data.category_id,
      data.date,
    ]
  );

  return result.rows[0] ?? null;
}


export async function deleteTransaction(
    transactionId: number,
    userId: number
): Promise<boolean> {
    const result = await pool.query(
        `DELETE FROM transactions
         WHERE id = $1
            AND user_id = $2
         RETURNING id`,
         [transactionId, userId]
    );

    return result.rowCount === 1;
}