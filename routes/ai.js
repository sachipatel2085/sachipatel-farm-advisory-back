// routes/ai.js
import express from "express";
import fs from "fs";

import { upload } from "../utils/upload.js";
import { compressImage } from "../utils/compressImage.js";
import { detectDisease } from "../utils/detectDisease.js";
import { mapDisease } from "../utils/mapDisease.js";
import { getSolution } from "../utils/aiSolution.js";

const router = express.Router();

router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    const originalPath = req.file.path;

    // 1. Compress
    const compressedPath = await compressImage(originalPath);
    //
    // 2. Detect disease
    const labels = await detectDisease(compressedPath);
    const disease = mapDisease(labels);

    // 3. AI solution
    const solution = await getSolution(disease);

    // 4. Clean files
    fs.unlinkSync(originalPath);
    fs.unlinkSync(compressedPath);

    res.json({ disease, solution, labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
