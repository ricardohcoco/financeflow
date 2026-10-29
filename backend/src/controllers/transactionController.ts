import type { Request, Response, NextFunction } from "express";
import {
  transactionSchema,
  transactionFilterSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";
import {
  createTransaction,
  deleteTransaction,
  findTransactionById,
  listTransactions,
  updateTransaction,
} from "../services/transactionService.js";
import { categoryIsValid } from "../services/categoryService.js";
import { getErrorCode } from "../errors/databaseError.js";

export async function addTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = transactionSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Dados da movimentação inválidos.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const userId = res.locals.userId as number;

  try {
    const transaction = await createTransaction(validation.data, userId);

    if (!transaction) {
      return res.status(400).json({
        message: "Categoria inexistente ou incompatível com o tipo.",
      });
    }

    return res.status(201).json({
      message: "Movimentação cadastrada com sucesso.",
      transaction,
    });
  } catch (error) {
    const code = getErrorCode(error);

    if (code === "23503" || code === "23514") {
      return res.status(400).json({
        message: "Dados da movimentação inválidos.",
      });
    }

    next(error);
}}

export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = transactionFilterSchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "Filtros inválidos.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const userId = res.locals.userId as number;

  try {
    const transactions = await listTransactions(userId, validation.data);

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = transactionIdSchema.safeParse(req.params.id);

  if (!validation.success) {
    return res.status(400).json({
      message: "ID da movimentação inválido.",
    });
  }

  const userId = res.locals.userId as number;

  try {
    const transaction = await findTransactionById(validation.data, userId);

    if (!transaction) {
      return res.status(404).json({
        message: "Movimentação não encontrada.",
      });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    next(error);
  }
}

export async function editTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const idValidation = transactionIdSchema.safeParse(req.params.id);

  if (!idValidation.success) {
    return res.status(400).json({
      message: "ID da movimentação inválido.",
    });
  }

  const validation = updateTransactionSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Dados da movimentação inválidos.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const userId = res.locals.userId as number;

  try {
    const categoryValid = await categoryIsValid(
      validation.data.category_id,
      validation.data.type,
    );

    if (!categoryValid) {
      return res.status(400).json({
        message: "Categoria inexistente ou incompatível com o tipo.",
      });
    }

    const transaction = await updateTransaction(
      idValidation.data,
      userId,
      validation.data,
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Movimentação não encontrada.",
      });
    }

    return res.status(200).json({
      message: "Movimentação atualizada com sucesso.",
      transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = transactionIdSchema.safeParse(req.params.id);

  if (!validation.success) {
    return res.status(400).json({
      message: "ID da movimentação inválido.",
    });
  }

  const userId = res.locals.userId as number;

  try {
    const deleted = await deleteTransaction(validation.data, userId);

    if (!deleted) {
      return res.status(404).json({
        message: "Movimentação não encontrada.",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
