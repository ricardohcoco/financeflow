import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getCategories } from "../controllers/categoryController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getCategories);

export default router;