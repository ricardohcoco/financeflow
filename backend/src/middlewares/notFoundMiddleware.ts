import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function notFoundMiddleware(
    _req: Request,
    _res: Response,
    next: NextFunction
) {
    next(new AppError(404, "Rota não encontrada."));
}