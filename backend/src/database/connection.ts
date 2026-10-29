import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
});

pool.on("error", (error) => {
    console.log("Erro em conexão ociosa do banco:", error.message);
});