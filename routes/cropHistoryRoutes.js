import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addCropHistory,
  deleteCropHistory,
  getCropHistory,
  updateCropHistory,
} from "../controllers/cropHistoryController.js";

const router = express.Router();

router.post("/", protect, addCropHistory);
router.get("/:cropId", protect, getCropHistory);
router.put("/:id", protect, updateCropHistory);
router.delete("/:id", protect, deleteCropHistory);

export default router;
