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
import cropActivityRoutes from "./routes/cropActivityRoutes.js";
import cropPlanningRoutes from "./routes/cropPlanningRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import diseaseRoutes from "./routes/diseaseRoutes.js";
import MandiService from "./services/mandiService.js";
import { seedDefaultAdvisoryRules } from "./controllers/advisoryController.js";
import { seedDefaultGeneralCropTasks } from "./controllers/cropActivityController.js";
import { seedDefaultPlantDiseases } from "./controllers/diseaseController.js";
import { seedCropDecisionRules } from "./controllers/cropPlanningController.js";
import { seedInitialCommunityDiscussions } from "./controllers/communityController.js";
import { backfillSlugs } from "./utils/slugify.js";
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

    // Check and initialize default agricultural advisory rules if empty
    try {
      await seedDefaultAdvisoryRules();
    } catch (advisoryErr) {
      console.warn("Advisory initial seeding warning:", advisoryErr.message);
    }

    // Check and initialize default general crop tasks if empty
    try {
      await seedDefaultGeneralCropTasks();
    } catch (generalTaskErr) {
      console.warn("General crop tasks seeding warning:", generalTaskErr.message);
    }

    // Check and initialize default plant disease advisories if empty
    try {
      await seedDefaultPlantDiseases();
    } catch (diseaseErr) {
      console.warn("Plant disease advisory seeding warning:", diseaseErr.message);
    }

    // Check and initialize default pre-sowing and rotation decision rules if empty
    try {
      await seedCropDecisionRules();
    } catch (decisionErr) {
      console.warn("Crop decision seeding warning:", decisionErr.message);
    }

    // Check and initialize initial community discussions if empty
    try {
      await seedInitialCommunityDiscussions();
    } catch (communityErr) {
      console.warn("Community initial seeding warning:", communityErr.message);
    }

    // Ensure all existing farms, crops, posts, and shops have unique slugs
    try {
      await backfillSlugs();
    } catch (slugErr) {
      console.warn("Slug backfill warning:", slugErr.message);
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
app.use("/api/planning", cropPlanningRoutes);
app.use("/api/advisory", advisoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/resolve", resolveRoute);
app.use("/api/finance", financeRoute);
app.use("/api/ai", aiRoutes);
app.use("/api/mandi", mandiRoutes);
app.use("/api/activities", cropActivityRoutes);
app.use("/api/crop-activities", cropActivityRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server run on port ${PORT}`));
