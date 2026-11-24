import express from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

import { upload } from "../middleware/upload.js";
import { compressImage } from "../utils/compressImage.js";
import { formatDisease } from "../utils/formatDisease.js";
import {
  findAdvisoryForDisease,
  formatAdvisoryToSolutionText,
} from "../controllers/diseaseController.js";

const router = express.Router();

const safeDelete = (filePath, retries = 5) => {
  if (!filePath || !fs.existsSync(filePath)) return;

  fs.unlink(filePath, (err) => {
    if (!err) {
      console.log("Deleted temporary file:", filePath);
      return;
    }

    if (err.code === "EBUSY" && retries > 0) {
      setTimeout(() => {
        safeDelete(filePath, retries - 1);
      }, 1000);
      return;
    }

    console.log("Delete failed:", err.code, err.message);
  });
};

/**
 * POST /api/ai/detect
 *
 * Sends the image to the Python v2 diagnostic service (/api/v2/diagnose).
 * The v2 service returns the full advisory, probable diseases, severity,
 * and recommended products — so the Node layer is primarily a pass-through
 * with a database fallback if the Python service is offline.
 */
router.post("/detect", upload.single("image"), async (req, res) => {
  let originalPath;
  let compressedPath;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    const targetCrop = req.body.crop || req.query.crop || null;
    const location = req.body.location || req.query.location || null;
    const district = req.body.district || req.query.district || null;
    const growthStage = req.body.growth_stage || req.query.growth_stage || null;

    originalPath = req.file.path;
    compressedPath = await compressImage(originalPath);

    // Prepare form data for Python v2 diagnostic service
    const formData = new FormData();
    formData.append("image", fs.createReadStream(compressedPath));
    if (targetCrop) formData.append("crop", targetCrop);
    if (location) formData.append("location", location);
    if (district) formData.append("district", district);
    if (growthStage) formData.append("growth_stage", growthStage);

    const pyUrl = process.env.PY_API_URL || "http://127.0.0.1:10000";

    let v2Response = null;
    try {
      // Try the new v2 endpoint first
      v2Response = await axios.post(`${pyUrl}/api/v2/diagnose`, formData, {
        headers: formData.getHeaders(),
        timeout: 45000,
      });
    } catch (v2Err) {
      console.warn("Python v2 service not available, trying legacy /predict:", v2Err.message);

      // Fallback: try legacy /predict endpoint
      const legacyForm = new FormData();
      legacyForm.append("image", fs.createReadStream(compressedPath));
      if (targetCrop) legacyForm.append("crop", targetCrop);

      try {
        const legacyRes = await axios.post(`${pyUrl}/predict`, legacyForm, {
          headers: legacyForm.getHeaders(),
          timeout: 25000,
        });

        if (legacyRes.data && legacyRes.data.success) {
          // Convert legacy response to v2-like shape using MongoDB advisory
          const rawDisease = legacyRes.data.disease;
          const cleanDisease = formatDisease(rawDisease);
          const dbAdvisory =
            (await findAdvisoryForDisease(rawDisease, targetCrop)) ||
            (await findAdvisoryForDisease(cleanDisease, targetCrop));
          const solutionText = formatAdvisoryToSolutionText(dbAdvisory);

          // Enrich candidates
          const topPreds = legacyRes.data.top_predictions || [];
          const candidatePromises = topPreds.map(async (tp) => {
            const cleanName = formatDisease(tp.disease);
            const adv =
              (await findAdvisoryForDisease(tp.disease, targetCrop)) ||
              (await findAdvisoryForDisease(cleanName, targetCrop));
            return {
              disease: tp.disease,
              displayName: adv?.name || cleanName,
              confidence: tp.confidence,
              category: adv?.category || "Fungal Disease",
              severity: adv?.severity || "medium",
              scientificName: adv?.scientificName || "",
              symptoms:
                adv?.symptoms && adv.symptoms.length > 0
                  ? adv.symptoms
                  : [
                      "Irregular spots or discoloration on leaf surface",
                      "Signs of plant stress or foliage decay",
                    ],
              advisory: adv || null,
              solution: adv ? formatAdvisoryToSolutionText(adv) : "",
            };
          });

          const probableDiseases = await Promise.all(candidatePromises);

          return res.json({
            disease: dbAdvisory?.name || cleanDisease,
            rawDisease,
            confidence: legacyRes.data.confidence,
            targetCrop,
            probable_diseases: probableDiseases,
            top_predictions: probableDiseases,
            solution: solutionText,
            advisory: dbAdvisory || null,
            source: "legacy_cnn_with_database",
          });
        }
      } catch (legacyErr) {
        console.warn("Legacy Python service also unavailable:", legacyErr.message);
      }
    }

    // If v2 responded successfully, pass through its full response
    if (v2Response && v2Response.data) {
      const v2Data = v2Response.data;

      // If the v2 response's advisory is minimal (untrained model),
      // try to enrich from our MongoDB database
      let dbAdvisory = null;
      if (v2Data.disease && v2Data.disease !== "Unknown Issue") {
        const cleanDisease = formatDisease(v2Data.rawDisease || v2Data.disease);
        dbAdvisory =
          (await findAdvisoryForDisease(v2Data.rawDisease || v2Data.disease, targetCrop)) ||
          (await findAdvisoryForDisease(cleanDisease, targetCrop));
      }

      // Merge: prefer v2 data but fill gaps from MongoDB if available
      const mergedAdvisory = v2Data.advisory || {};
      if (dbAdvisory) {
        if (!mergedAdvisory.cause || !mergedAdvisory.cause.trim()) {
          mergedAdvisory.cause = dbAdvisory.cause || "";
        }
        if (!mergedAdvisory.chemicalTreatment || !mergedAdvisory.chemicalTreatment.trim()) {
          mergedAdvisory.chemicalTreatment = dbAdvisory.chemicalTreatment || "";
        }
        if (!mergedAdvisory.organicSolution || !mergedAdvisory.organicSolution.trim()) {
          mergedAdvisory.organicSolution = dbAdvisory.organicSolution || "";
        }
        if (!mergedAdvisory.prevention || !mergedAdvisory.prevention.trim()) {
          mergedAdvisory.prevention = dbAdvisory.prevention || "";
        }
        if (!mergedAdvisory.symptoms || mergedAdvisory.symptoms.length === 0) {
          mergedAdvisory.symptoms = dbAdvisory.symptoms || [];
        }
        if (!mergedAdvisory.recommendedProducts || mergedAdvisory.recommendedProducts.length === 0) {
          mergedAdvisory.recommendedProducts = dbAdvisory.recommendedProducts || [];
        }
      }

      // Also enrich each probable disease with MongoDB data where needed
      let probableDiseases = v2Data.probable_diseases || v2Data.top_predictions || [];
      if (probableDiseases.length > 0) {
        const enrichedPromises = probableDiseases.map(async (pd) => {
          if (pd.advisory && pd.advisory.cause && pd.advisory.cause.trim()) {
            return pd; // Already has full data from v2
          }
          // Try to fill from MongoDB
          const cleanName = formatDisease(pd.disease || pd.displayName);
          const dbAdv =
            (await findAdvisoryForDisease(pd.disease, targetCrop)) ||
            (await findAdvisoryForDisease(cleanName, targetCrop));
          if (dbAdv) {
            return {
              ...pd,
              displayName: pd.displayName || dbAdv.name || cleanName,
              category: pd.category || dbAdv.category || "",
              severity: pd.severity || dbAdv.severity || "medium",
              scientificName: pd.scientificName || dbAdv.scientificName || "",
              symptoms:
                pd.symptoms && pd.symptoms.length > 0 && pd.symptoms[0] !== "Irregular spots or discoloration on leaf surface"
                  ? pd.symptoms
                  : dbAdv.symptoms || pd.symptoms,
              advisory: {
                ...(pd.advisory || {}),
                name: dbAdv.name || pd.advisory?.name || "",
                cause: pd.advisory?.cause?.trim() ? pd.advisory.cause : dbAdv.cause || "",
                chemicalTreatment: pd.advisory?.chemicalTreatment?.trim() ? pd.advisory.chemicalTreatment : dbAdv.chemicalTreatment || "",
                organicSolution: pd.advisory?.organicSolution?.trim() ? pd.advisory.organicSolution : dbAdv.organicSolution || "",
                prevention: pd.advisory?.prevention?.trim() ? pd.advisory.prevention : dbAdv.prevention || "",
                recommendedProducts: pd.advisory?.recommendedProducts?.length > 0
                  ? pd.advisory.recommendedProducts
                  : dbAdv.recommendedProducts || [],
              },
              solution: pd.solution?.trim() ? pd.solution : formatAdvisoryToSolutionText(dbAdv),
            };
          }
          return pd;
        });

        probableDiseases = await Promise.all(enrichedPromises);
      }

      return res.json({
        disease: dbAdvisory?.name || v2Data.disease,
        rawDisease: v2Data.rawDisease || v2Data.disease,
        confidence: v2Data.confidence,
        targetCrop,
        probable_diseases: probableDiseases,
        top_predictions: probableDiseases,
        solution: mergedAdvisory.cause
          ? formatAdvisoryToSolutionText(mergedAdvisory)
          : v2Data.solution || "",
        advisory: mergedAdvisory,
        source: v2Data.source || "ai_pipeline_v2",
        v2: v2Data.v2 || null,
      });
    }

    // If neither service worked, return an informative error
    return res.status(503).json({
      error: "AI diagnostic service is currently unavailable",
      details: "Neither the v2 pipeline nor the legacy CNN could be reached. Please ensure the Python service is running.",
    });

  } catch (err) {
    console.error("DETECT ERROR:", err.message);

    return res.status(500).json({
      error: "Detection failed",
      details: err.message,
    });
  } finally {
    if (originalPath) {
      safeDelete(originalPath);
    }
    if (compressedPath) {
      safeDelete(compressedPath);
    }
  }
});

export default router;
