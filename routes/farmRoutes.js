import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createFarm,
  getFarms,
  updateFarm,
  deleteFarm,
  uploadFarmPhotos,
  getFarmById,
  getFarmAnalytics,
  getFarmHistory,
} from "../controllers/farmController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createFarm).get(protect, getFarms);
router.get("/:id", protect, getFarmById);
router.get("/:id/analytics", protect, getFarmAnalytics);
router.get("/:id/history", protect, getFarmHistory);
router.route("/:id").put(protect, updateFarm).delete(protect, deleteFarm);
router.post(
  "/:id/photos",
  protect,
  upload.array("photos", 5),
  uploadFarmPhotos,
);

export default router;
