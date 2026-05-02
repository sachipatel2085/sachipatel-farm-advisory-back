import express from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

import { upload } from "../middleware/upload.js";
import { compressImage } from "../utils/compressImage.js";
import { analyzeImage } from "../utils/aiSolution.js";
import { formatDisease } from "../utils/formatDisease.js";

const router = express.Router();

/* ✅ SAFE DELETE FUNCTION (fixes EBUSY error) */
const safeDelete = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) console.log("Delete failed:", err.message);
      else console.log("Deleted:", filePath);
    });
  }, 2000);
};

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const originalPath = req.file.path;
    console.log("STEP 1: Upload OK");

    /* 🔹 Compress image */
    const compressedPath = await compressImage(originalPath);
    console.log("STEP 2: Compression OK");

    /* 🔹 Send to Python ML API */
    const formData = new FormData();
    formData.append("image", fs.createReadStream(compressedPath));

    const mlResponse = await axios.post(
      "http://localhost:5001/predict",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    console.log("STEP 3: ML Response:", mlResponse.data);

    /* 🔹 Extract ML data */
    const { disease, confidence, top_predictions } = mlResponse.data;

    /* 🔹 Format disease name */
    const cleanDisease = formatDisease(disease);

    console.log("STEP 4: Disease:", cleanDisease);

    /* 🔹 Get AI advisory (safe fallback) */
    let solution = "AI service unavailable";

    try {
      solution = await analyzeImage(cleanDisease);
      console.log("STEP 5: AI OK");
    } catch (err) {
      console.log("AI FAILED:", err.message);
    }

    /* 🔹 Cleanup (safe delete) */
    safeDelete(originalPath);
    safeDelete(compressedPath);

    /* 🔹 Final response */
    res.json({
      disease: cleanDisease,
      confidence,
      top_predictions,
      solution,
    });
  } catch (err) {
    console.error("DETECT ERROR:", err.message);

    res.status(500).json({
      error: "Detection failed",
      details: err.message,
    });
  }
});

export default router;
