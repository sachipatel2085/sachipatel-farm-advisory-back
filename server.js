import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import farmRoutes from "./routes/farmRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import profitRoutes from "./routes/profitRoutes.js";
import decisionRoutes from "./routes/decisionRoutes.js";
import advisoryRoutes from "./routes/advisoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resolveRoute from "./routes/resolve.js";
import financeRoute from "./routes/financeRoutes.js";
import cropHistoryRoutes from "./routes/cropHistoryRoutes.js";
import aiRoutes from "./routes/ai.js";
import mandiRoutes from "./routes/mandiRoutes.js";
import MandiService from "./services/mandiService.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sachipatel-farm-advisory-back.onrender.com",
      "https://sachipatel-farm-advisory.vercel.app",
      "https://sachipatel-farm-advisory-299fc1fzr-sachipatel-s-projects.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({ status: "smart Farm api runnung" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("mongoDB is connected");
    // Check and initialize default mandi market rates if empty
    try {
      const seedResult = await MandiService.seedInitialData();
      console.log("Mandi initialization:", seedResult.message);
    } catch (seedErr) {
      console.warn("Mandi initial seeding warning:", seedErr.message);
    }
  })
  .catch((err) => {
    console.error("mongo error : ", err);
    process.exit(1);
  });

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/profit", profitRoutes);
app.use("/api/crop-history", cropHistoryRoutes);
app.use("/api/decision", decisionRoutes);
app.use("/api/advisory", advisoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/resolve", resolveRoute);
app.use("/api/finance", financeRoute);
app.use("/api/ai", aiRoutes);
app.use("/api/mandi", mandiRoutes);
app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
