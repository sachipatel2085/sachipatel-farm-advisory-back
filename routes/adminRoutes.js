import express from "express";
import {
  getAdminOverview,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  claimAdminRole,
  getAdminAdvisoryRules,
  createAdminAdvisoryRule,
  updateAdminAdvisoryRule,
  deleteAdminAdvisoryRule,
  getAdminCommunity,
  deleteAdminCommunityPost,
  getAdminGeneralTasks,
  createAdminGeneralTask,
  updateAdminGeneralTask,
  deleteAdminGeneralTask,
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow authenticated user to claim admin role with key for demo/onboarding
router.post("/claim-admin", protect, claimAdminRole);

// All subsequent routes require active Admin or Moderator privileges
router.get("/overview", protect, requireAdmin, getAdminOverview);
router.get("/users", protect, requireAdmin, getAdminUsers);
router.patch("/users/:id/role", protect, requireAdmin, updateUserRole);
router.delete("/users/:id", protect, requireAdmin, deleteUser);

// Agronomic Advisory Rules Management
router.get("/advisory-rules", protect, requireAdmin, getAdminAdvisoryRules);
router.post("/advisory-rules", protect, requireAdmin, createAdminAdvisoryRule);
router.put("/advisory-rules/:id", protect, requireAdmin, updateAdminAdvisoryRule);
router.delete("/advisory-rules/:id", protect, requireAdmin, deleteAdminAdvisoryRule);

// General Crop Tasks Management (Admin & Moderator)
router.get("/general-tasks", protect, requireAdmin, getAdminGeneralTasks);
router.post("/general-tasks", protect, requireAdmin, createAdminGeneralTask);
router.put("/general-tasks/:id", protect, requireAdmin, updateAdminGeneralTask);
router.delete("/general-tasks/:id", protect, requireAdmin, deleteAdminGeneralTask);

// Community Discussions Moderation
router.get("/community", protect, requireAdmin, getAdminCommunity);
router.delete("/community/:id", protect, requireAdmin, deleteAdminCommunityPost);

export default router;
