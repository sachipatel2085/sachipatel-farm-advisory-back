import express from "express";
import {
  getFinanceSummary,
  getShopSummary,
  createShop,
  addCredit,
  addPayment,
  getAllTransactions,
  getShopLedger,
  deleteCredit,
  deletePayment,
  updateCredit,
  updatePayment,
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
router.delete("/credit/:id", protect, deleteCredit);
router.delete("/payment/:id", protect, deletePayment);
router.put("/credit/:id", protect, updateCredit);
router.put("/payment/:id", protect, updatePayment);

export default router;
