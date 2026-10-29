import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({
            message: "Token não informado.",
        });
        return;
    }

    const match = /^Bearer (\S+)$/i.exec(authorization);

    if (!match) {
        res.status(401).json({
            message: "Formato de autorização inválido.",
        });
        return;
    }

    const token = match[1];
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        next(new Error("Configuração JWT inválida."));
        return;
    }

    try {
        const decoded = jwt.verify(token, secret, {
            algorithms: ["HS256"],
            issuer: "financeflow-api",
        });

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            !/^[1-9]\d*$/.test(decoded.sub)
        ) {
            res.status(401).json({
                message: "Token inválido.",
            });
            return;
        }

        const userId = Number(decoded.sub);

        if (!Number.isSafeInteger(userId)) {
            res.status(401).json({
                message: "Token inválido.",
            });
            return;
        }

        res.locals.userId = userId;

        next();
    } catch {
        res.status(401).json({
            message: "Token inválido ou expirado.",
        });
    }
}