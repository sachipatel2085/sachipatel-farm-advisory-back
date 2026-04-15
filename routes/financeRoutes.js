import express from "express";
import {
  getFinanceSummary,
  getShopSummary,
  createShop,
  addCredit,
  addPayment,
} from "../controllers/financeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getFinanceSummary);
router.get("/shops", protect, getShopSummary);

router.post("/shop", protect, createShop);
router.post("/credit", protect, addCredit);
router.post("/payment", protect, addPayment);

export default router;
