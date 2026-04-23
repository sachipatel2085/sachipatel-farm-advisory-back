import express from "express";
import {
  createCrop,
  getCropsByFarm,
  getAllUserCrops,
  updateCrop,
  deleteCrop,
  getCropById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addHarvestBatch,
  markCropFailed,
} from "../controllers/cropController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCrop);
router.post("/:id/harvest-batch", protect, addHarvestBatch);
router.post("/:id/transaction", protect, addTransaction);

router.get("/", protect, getAllUserCrops);
router.get("/farm/:farmId", protect, getCropsByFarm);
router.get("/:id", protect, getCropById);

router.route("/:id").put(protect, updateCrop).delete(protect, deleteCrop);
router.put("/:id/transaction/:txnId", protect, updateTransaction);
router.put("/:id/fail", protect, markCropFailed);
router.delete("/:id/transaction/:txnId", protect, deleteTransaction);

export default router;
