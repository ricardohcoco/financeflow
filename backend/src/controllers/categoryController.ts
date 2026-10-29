import type { Request, Response, NextFunction } from "express";
import { listCategories } from "../services/categoryService.js";

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await listCategories();

    return res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}
