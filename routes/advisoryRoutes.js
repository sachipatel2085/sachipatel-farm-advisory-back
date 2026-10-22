import express from "express";
import {
  getAdvisoryForCrop,
  getAllUserAdvisories,
} from "../controllers/advisoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllUserAdvisories);
router.get("/crop/:cropId", protect, getAdvisoryForCrop);

export default router;
