import express from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

import { upload } from "../middleware/upload.js";
import { compressImage } from "../utils/compressImage.js";
import { analyzeImage } from "../utils/aiSolution.js";
import { formatDisease } from "../utils/formatDisease.js";

const router = express.Router();

const PY_API_URL = process.env.PY_API_URL;

const safeDelete = (filePath, retries = 5) => {
  if (!filePath || !fs.existsSync(filePath)) return;

  fs.unlink(filePath, (err) => {
    if (!err) {
      console.log("Deleted:", filePath);
      return;
    }

    if (err.code === "EBUSY" && retries > 0) {
      console.log(`File busy. Retrying... (${retries} attempts left)`);

      setTimeout(() => {
        safeDelete(filePath, retries - 1);
      }, 1000);

      return;
    }

    console.log("Delete failed:", err.code, err.message);
  });
};

router.post("/detect", upload.single("image"), async (req, res) => {
  let originalPath;
  let compressedPath;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    originalPath = req.file.path;

    console.log("STEP 1: Upload OK");

    compressedPath = await compressImage(originalPath);

    console.log("STEP 2: Compression OK");

    const formData = new FormData();

    formData.append("image", fs.createReadStream(compressedPath));

    const mlResponse = await axios.post(
      `${process.env.PY_API_URL}/predict`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    console.log("STEP 3: ML Response:", mlResponse.data);

    const { disease, confidence, top_predictions } = mlResponse.data;

    const cleanDisease = formatDisease(disease);

    console.log("STEP 4: Disease:", cleanDisease);

    let solution = "AI service unavailable";

    try {
      solution = await analyzeImage(cleanDisease);

      console.log("STEP 5: AI OK");
    } catch (err) {
      console.log("AI FAILED:", err.message);
    }

    return res.json({
      disease: cleanDisease,
      confidence,
      top_predictions,
      solution,
    });
  } catch (err) {
    console.error("DETECT ERROR:", err.message);

    return res.status(500).json({
      error: "Detection failed",
      details: err.message,
    });
  } finally {
    // Cleanup after response processing
    if (originalPath) {
      safeDelete(originalPath);
    }

    if (compressedPath) {
      safeDelete(compressedPath);
    }
  }
});
export default router;
