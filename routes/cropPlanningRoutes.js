import express from "express";
import {
  getPreSowingRecommendations,
  getCropRotationPlan,
  estimateInputCosts,
  getAgronomicCalendar,
} from "../controllers/cropPlanningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/pre-sowing", protect, getPreSowingRecommendations);
router.post("/recommend", protect, getPreSowingRecommendations);
router.post("/rotation", protect, getCropRotationPlan);
router.post("/cost-estimator", protect, estimateInputCosts);
router.get("/calendar", protect, getAgronomicCalendar);

export default router;
