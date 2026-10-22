import express from "express";
import {
  getCropRecommendations,
  getPreSowingRecommendations,
  getCropRotationPlan,
  estimateInputCosts,
  getAgronomicCalendar,
} from "../controllers/decisionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/recommend", protect, getCropRecommendations);
router.post("/pre-sowing", protect, getPreSowingRecommendations);
router.post("/rotation", protect, getCropRotationPlan);
router.post("/cost-estimator", protect, estimateInputCosts);
router.get("/calendar", protect, getAgronomicCalendar);

export default router;
