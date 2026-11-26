import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  updateProfile,
  uploadProfileAvatar,
  changePassword,
  updatePushToken,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/authValidator.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);

router.post("/login", authLimiter, validate(loginSchema), loginUser);

router.post("/google", authLimiter, googleLogin);

router.get("/me", protect, getMe);

router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

router.post("/profile/avatar", protect, upload.single("avatar"), uploadProfileAvatar);

router.put("/password", protect, authLimiter, validate(changePasswordSchema), changePassword);

router.put("/push-token", protect, updatePushToken);

export default router;
