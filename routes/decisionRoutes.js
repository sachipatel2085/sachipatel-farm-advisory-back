import express from "express";
import { getCropRecommendations } from "../controllers/decisionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/recommend", protect, getCropRecommendations);

export default router;