import express from "express";
import {
  createExpense,
  getExpensesByCrop,
  getCropExpenseTotal,
  deleteExpense
} from "../controllers/expenseController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/crop/:cropId", protect, getExpensesByCrop);
router.get("/crop/:cropId/total", protect, getCropExpenseTotal);
router.delete("/:id", protect, deleteExpense);

export default router;