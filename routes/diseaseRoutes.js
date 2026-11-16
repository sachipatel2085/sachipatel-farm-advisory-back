import express from "express";
import {
  getAllDiseases,
  getDiseaseAdvisory,
  createAdminDiseaseAdvisory,
  updateAdminDiseaseAdvisory,
  deleteAdminDiseaseAdvisory,
} from "../controllers/diseaseController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Farmer Disease Knowledge Base Routes
router.get("/", getAllDiseases);
router.get("/:idOrKey", getDiseaseAdvisory);

// Admin & Moderator Disease Advisory Management
router.post("/", protect, requireAdmin, createAdminDiseaseAdvisory);
router.put("/:id", protect, requireAdmin, updateAdminDiseaseAdvisory);
router.delete("/:id", protect, requireAdmin, deleteAdminDiseaseAdvisory);

export default router;
