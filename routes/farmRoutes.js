import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createFarm,
  getFarms,
  updateFarm,
  deleteFarm,
  uploadFarmPhotos,
} from "../controllers/farmController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createFarm).get(protect, getFarms);

router.route("/:id").put(protect, updateFarm).delete(protect, deleteFarm);
router.post(
  "/:id/photos",
  protect,
  upload.array("photos", 5),
  uploadFarmPhotos,
);

export default router;
