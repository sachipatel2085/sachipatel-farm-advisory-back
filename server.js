import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
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

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sachipatel-farm-advisory-back.onrender.com",
      "https://sachipatel-farm-advisory.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "smart Farm api runnung" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongoDB is connected"))
  .catch((err) => {
    console.error("mongo error : ", err);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "something went wrong",
    error: err.message,
  });
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
