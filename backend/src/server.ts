import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./database/connection.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    })
);

app.use(express.json());

app.use("/", authRoutes);

app.use("/users", userRoutes);

app.use("/categories", categoryRoutes);

app.use("/transactions", transactionRoutes);

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "FinanceFlow API funcionando!",
    });
});

app.get("/health/db", async (_req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ok",
            database: "connected",
        });
    } catch (error) {
        const errorCode = 
            error instanceof Error && "code" in error
                ? String(error.code)
                : "UNKNOWN";
        
        console.error("Falha ao consultar banco:", errorCode);

        res.status(503).json({
            status: "error",
            message: "Banco de dados temporariamente indisponível.",
        });
    }
});


app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});