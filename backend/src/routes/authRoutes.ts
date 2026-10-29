import { Router } from "express";
import { login } from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/loginLimiter.js";

const router = Router();

router.post("/login", loginLimiter, login);

export default router;