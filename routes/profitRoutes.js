import express from "express";
import {
  createProfitRecord,
  getProfitByCrop
} from "../controllers/profitController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProfitRecord);
router.get("/crop/:cropId", protect, getProfitByCrop);

export default router;