import express from "express";
import {
  createField,
  getFieldsByFarm,
  updateField,
  deleteField
} from "../controllers/fieldController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createField);
router.get("/farm/:farmId", protect, getFieldsByFarm);

router.route("/:id")
  .put(protect, updateField)
  .delete(protect, deleteField);

export default router;