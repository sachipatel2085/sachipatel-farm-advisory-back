import express from "express";
import {
  createActivity,
  getAllUserActivities,
  getCropActivities,
  updateActivity,
  toggleActivityStatus,
  deleteActivity,
  generateStandardSchedule,
} from "../controllers/cropActivityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createActivity);
router.get("/", protect, getAllUserActivities);
router.get("/crop/:cropId", protect, getCropActivities);
router.put("/:id", protect, updateActivity);
router.patch("/:id/toggle", protect, toggleActivityStatus);
router.delete("/:id", protect, deleteActivity);
router.post("/crop/:cropId/generate-schedule", protect, generateStandardSchedule);

export default router;
