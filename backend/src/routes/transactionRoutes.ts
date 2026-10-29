import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addTransaction, getTransactions, getTransactionById, editTransaction, removeTransaction } from "../controllers/transactionController.js";

const router = Router();

router.use(authMiddleware);

router.post("/", addTransaction);
router.get("/", getTransactions);

router.get("/:id", getTransactionById);
router.put("/:id", editTransaction);
router.delete("/:id", removeTransaction);

export default router;