import express from "express";
import { getAdvisoryForCrop } from "../controllers/advisoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/crop/:cropId", protect, getAdvisoryForCrop);

export default router;
