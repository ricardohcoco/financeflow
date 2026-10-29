import bcrypt from "bcrypt";
import { RegisterInput } from "../schemas/authSchema.js";
import { pool } from "../database/connection.js";
import jwt from "jsonwebtoken";
import type { LoginInput } from "../schemas/authSchema.js";
import { DUMMY_PASSWORD_HASH } from "../config/auth.js";

export async function registerUser(data: RegisterInput) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await pool.query<{
        id: number;
        name: string;
        email: string;
    }>(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
         [data.name, data.email, passwordHash]
    );

    return result.rows[0];
}

export async function authenticateUser(data: LoginInput) {
    const result = await pool.query<{
        id: number;
        name: string;
        email: string;
        password_hash: string;
    }>(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE LOWER(email) = $1`,
         [data.email]
    );

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        data.password,
        user?.password_hash ?? DUMMY_PASSWORD_HASH
    );

    if (!user || !passwordMatches) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}

export function generateToken(userId: number) {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET não configurado corretamente.");
    }

    return jwt.sign(
        {},
        secret,
        {
            algorithm: "HS256",
            subject: String(userId),
            expiresIn: 60 * 60,
            issuer: "financeflow-api",
        }
    );
}