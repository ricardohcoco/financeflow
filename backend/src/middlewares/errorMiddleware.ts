import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { getErrorCode, isDatabaseUnavailable } from "../errors/databaseError.js";
import { log } from "../utils/logger.js";

export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    if (res.headersSent) {
        return next(error);
    }

    if (
        error instanceof SyntaxError &&
        "status" in error &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            message: "JSON inválido na requisição.",
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }

    const code = getErrorCode(error);

    if (isDatabaseUnavailable(error)) {
        log("error", {
            event: "database_unavailable",
            code,
            status: 503,
        });
        
        return res.status(503).json({
            message: "Serviço temporariamente indisponível.",
        });
    }

    log("error", {
        event: "internal_error",
        code,
        status: 500,
    });

    return res.status(500).json({
        message: "Ocorreu um erro interno no servidor.",
    });
}