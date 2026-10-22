import express from "express";
import {
  getWeatherAlerts,
  getFarmWeather,
} from "../controllers/weatherController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get smart alerts and current weather for authenticated farmer
router.get("/alerts", protect, getWeatherAlerts);

// Get weather & forecast for a specific farm
router.get("/farm/:id", protect, getFarmWeather);

export default router;
