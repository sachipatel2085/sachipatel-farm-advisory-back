import express from "express";
import {
  getFinanceSummary,
  getShopSummary,
  createShop,
  addCredit,
  addPayment,
  getAllTransactions,
  getShopLedger,
} from "../controllers/financeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getFinanceSummary);
router.get("/shops", protect, getShopSummary);
router.get("/transactions", protect, getAllTransactions);
router.get("/shop/:id", protect, getShopLedger);

router.post("/shop", protect, createShop);
router.post("/credit", protect, addCredit);
router.post("/payment", protect, addPayment);

export default router;
