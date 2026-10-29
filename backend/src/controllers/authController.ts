import type { Request, Response, NextFunction } from "express";
import { loginSchema } from "../schemas/authSchema.js";
import { authenticateUser, generateToken } from "../services/authServices.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Dados de login inválidos.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const user = await authenticateUser(validation.data);

    if (!user) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}
