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

import {
  apiLimiter,
  uploadLimiter,
} from "../middleware/rateLimitMiddleware.js";

import { validate } from "../middleware/validateMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

import {
  createFarmSchema,
  updateFarmSchema,
} from "../validators/farmValidator.js";

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

// Create + Get farms
router.route("/").post(validate(createFarmSchema), createFarm).get(getFarms);

// Get single farm
router.get("/:id", validateObjectId(), getFarmById);

// Farm analytics
router.get("/:id/analytics", validateObjectId(), getFarmAnalytics);

// Farm history
router.get("/:id/history", validateObjectId(), getFarmHistory);

// Update farm
router.put("/:id", validateObjectId(), validate(updateFarmSchema), updateFarm);

// Delete farm
router.delete("/:id", validateObjectId(), deleteFarm);

// Upload farm photos
router.post(
  "/:id/photos",
  uploadLimiter,
  validateObjectId(),
  upload.array("photos", 5),
  uploadFarmPhotos,
);

export default router;
