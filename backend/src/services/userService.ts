import { pool } from "../database/connection.js";

export async function findUserById(userId: number) {
    const result = await pool.query<{
        id: number;
        name: string;
        email: string;
        created_at: Date;
    }>(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
         [userId]
    );

    return result.rows[0] ?? null;
}