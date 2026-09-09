import express from "express";
import {
  getMarketRates,
  getPriceTrends,
  getMarketComparison,
  getFilters,
  getTodaySummary,
  syncRates,
} from "../controllers/mandiController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { apiLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// router.use(apiLimiter);

// Public / open data endpoints for farmers
router.get("/", getMarketRates);
router.get("/filters", getFilters);
router.get("/trends", getPriceTrends);
router.get("/compare", getMarketComparison);
router.get("/today-summary", optionalProtect, getTodaySummary);

// Synchronization & seeding endpoint
router.post("/sync", optionalProtect, syncRates);

export default router;
