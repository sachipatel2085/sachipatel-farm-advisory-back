import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);

router.post("/login", authLimiter, validate(loginSchema), loginUser);

export default router;
