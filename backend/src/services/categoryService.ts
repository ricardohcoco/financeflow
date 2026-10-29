import { pool } from "../database/connection.js";

export async function listCategories() {
    const result = await pool.query<{
        id: number;
        name: string;
        type: string;
    }>(
        `SELECT id, name, type
         FROM categories 
         ORDER BY type, name`
    );

    return result.rows;
}

export async function categoryIsValid(
    categoryId: number,
    type: "receita" | "despesa"
): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1
         FROM categories
         WHERE id = $1
            AND type = $2::varchar(10)`,
        [categoryId, type]
    );

    return result.rowCount === 1;
}