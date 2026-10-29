import { registerSchema } from "../schemas/authSchema.js";
import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/authServices.js";
import { findUserById } from "../services/userService.js";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Dados de cadastro inválidos.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const user = await registerUser(validation.data);

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user,
    });
  } catch (error) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        message: "Este e-mail já está cadastrado.",
      });
    }

    next(error);
  }
}

export async function getCurrentUser(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = res.locals.userId as number;

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({
        message: "Usuário da sessão não encontrado.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}
