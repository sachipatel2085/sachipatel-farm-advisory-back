import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);

router.post("/login", authLimiter, validate(loginSchema), loginUser);

router.post("/google", authLimiter, googleLogin);

router.get("/me", protect, getMe);

export default router;
