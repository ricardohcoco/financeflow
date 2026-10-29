import { Router } from "express";
import { createUser, getCurrentUser } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", createUser);
router.get("/me", authMiddleware, getCurrentUser);

export default router;