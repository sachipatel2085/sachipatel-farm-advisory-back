import PlantDiseaseAdvisory from "../models/PlantDiseaseAdvisory.js";
import { commonDiseaseAdvisories } from "../utils/diseaseKnowledgeBase.js";

/**
 * Seed or update plant disease advisories into MongoDB
 * Uses upsert so existing records are smoothly updated to the clean multi-crop schema.
 */
export const seedDefaultPlantDiseases = async () => {
  try {
    for (const item of commonDiseaseAdvisories) {
      await PlantDiseaseAdvisory.findOneAndUpdate(
        { diseaseKey: item.diseaseKey.toLowerCase() },
        {
          $set: {
            ...item,
            active: true,
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
    }

    console.log(
      `Synchronized ${commonDiseaseAdvisories.length} universal plant disease advisories across multiple crops.`
    );
  } catch (err) {
    console.warn("Plant disease advisory auto-seed warning:", err.message);
  }
};

/**
 * Normalizes an incoming raw ML prediction or search term
 * e.g. "Potato___Late_blight" -> "late blight"
 * "Tomato_Early_blight" -> "early blight"
 */
export const normalizeDiseaseQuery = (rawStr = "") => {
  if (!rawStr) return "";
  let clean = String(rawStr)
    .replace(/^tomato_+/i, "")
    .replace(/^potato_+/i, "")
    .replace(/^pepper__+bell__+/i, "")
    .replace(/^wheat_+/i, "")
    .replace(/^rice_+/i, "")
    .replace(/^chilli_+/i, "")
    .replace(/___+/g, " ")
    .replace(/__+/g, " ")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return clean;
};

/**
 * Core query helper: Find disease advisory from MongoDB database
 * Tries:
 * 1. Exact diseaseKey match
 * 2. Tags match
 * 3. Exact raw label match
 * 4. Normalized regex match on name or crop
 * If targetCrop is provided, prioritizes matching diseases affecting that crop.
 */
export const findAdvisoryForDisease = async (rawDiseaseName, targetCrop = null) => {
  if (!rawDiseaseName) return null;

  const normalized = normalizeDiseaseQuery(rawDiseaseName);
  const rawKey = String(rawDiseaseName).trim().toLowerCase().replace(/\s+/g, "_");

  const cropFilter = targetCrop && targetCrop !== "all"
    ? { crops: { $regex: new RegExp(`^${targetCrop.trim()}$`, "i") } }
    : {};

  // 1. Direct diseaseKey match
  let advisory = await PlantDiseaseAdvisory.findOne({
    $or: [
      { diseaseKey: rawKey },
      { diseaseKey: normalized.replace(/\s+/g, "_") },
      { tags: rawDiseaseName },
      { tags: normalized },
    ],
    ...cropFilter,
    active: true,
  }).lean();

  if (advisory) return advisory;

  // 1b. If cropFilter was restrictive, try without cropFilter
  if (targetCrop && targetCrop !== "all") {
    advisory = await PlantDiseaseAdvisory.findOne({
      $or: [
        { diseaseKey: rawKey },
        { diseaseKey: normalized.replace(/\s+/g, "_") },
        { tags: rawDiseaseName },
        { tags: normalized },
      ],
      active: true,
    }).lean();
    if (advisory) return advisory;
  }

  // 2. Tag match case-insensitive
  advisory = await PlantDiseaseAdvisory.findOne({
    tags: { $regex: new RegExp(`^${normalized}$`, "i") },
    active: true,
  }).lean();

  if (advisory) return advisory;

  // 3. Name or scientific name regex match
  advisory = await PlantDiseaseAdvisory.findOne({
    $or: [
      { name: new RegExp(normalized, "i") },
      { scientificName: new RegExp(normalized, "i") },
    ],
    active: true,
  }).lean();

  if (advisory) return advisory;

  // 4. Token fuzzy match (e.g. "early blight", "late blight", "powdery mildew", "bacterial spot")
  const tokens = normalized.split(" ").filter((t) => t.length > 3);
  if (tokens.length > 0) {
    advisory = await PlantDiseaseAdvisory.findOne({
      $and: tokens.map((token) => ({
        $or: [
          { name: new RegExp(token, "i") },
          { diseaseKey: new RegExp(token, "i") },
          { tags: new RegExp(token, "i") },
        ],
      })),
      active: true,
    }).lean();
  }

  return advisory;
};

/**
 * Format database advisory into standard formatted solution text
 */
export const formatAdvisoryToSolutionText = (advisory) => {
  if (!advisory) return "No specific database advisory found for this disease.";

  let text = "";
  text += `Cause:\n${advisory.cause}\n\n`;

  if (advisory.chemicalTreatment) {
    text += `Treatment:\n${advisory.chemicalTreatment}\n\n`;
  }

  if (advisory.organicSolution) {
    text += `Organic Solution:\n${advisory.organicSolution}\n\n`;
  }

  if (advisory.prevention) {
    text += `Prevention:\n${advisory.prevention}\n\n`;
  }

  return text.trim();
};

/**
 * GET /api/diseases
 * List and search all plant disease advisories from database
 */
export const getAllDiseases = async (req, res) => {
  try {
    const {
      crop,
      category,
      severity,
      search,
      page = 1,
      limit = 30,
    } = req.query;

    const query = { active: true };

    if (crop && crop !== "all") {
      query.crops = { $regex: new RegExp(`^${crop.trim()}$`, "i") };
    }

    if (category && category !== "all") {
      query.category = category.trim().toLowerCase();
    }

    if (severity && severity !== "all") {
      query.severity = severity.trim().toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: new RegExp(q, "i") },
        { scientificName: new RegExp(q, "i") },
        { crops: new RegExp(q, "i") },
        { cause: new RegExp(q, "i") },
        { tags: new RegExp(q, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, diseases, rawCrops] = await Promise.all([
      PlantDiseaseAdvisory.countDocuments(query),
      PlantDiseaseAdvisory.find(query)
        .sort({ severity: -1, name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PlantDiseaseAdvisory.distinct("crops", { active: true }),
    ]);

    // Flatten and deduplicate distinct crops
    const allCropsSet = new Set();
    rawCrops.forEach((c) => {
      if (Array.isArray(c)) {
        c.forEach((item) => allCropsSet.add(item));
      } else if (typeof c === "string") {
        allCropsSet.add(c);
      }
    });

    const sortedCrops = Array.from(allCropsSet)
      .filter((c) => c && c !== "All Crops")
      .sort();

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      crops: sortedCrops,
      diseases,
    });
  } catch (error) {
    console.error("getAllDiseases error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/diseases/:idOrKey
 * Get specific disease advisory by MongoDB _id or diseaseKey
 */
export const getDiseaseAdvisory = async (req, res) => {
  try {
    const { idOrKey } = req.params;
    const { crop } = req.query;

    let disease = null;
    if (idOrKey.match(/^[0-9a-fA-F]{24}$/)) {
      disease = await PlantDiseaseAdvisory.findById(idOrKey).lean();
    }

    if (!disease) {
      disease = await findAdvisoryForDisease(idOrKey, crop);
    }

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: `Disease advisory not found for "${idOrKey}"`,
      });
    }

    res.json({
      success: true,
      disease,
    });
  } catch (error) {
    console.error("getDiseaseAdvisory error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin: Create Disease Advisory
 */
export const createAdminDiseaseAdvisory = async (req, res) => {
  try {
    const {
      name,
      diseaseKey,
      crops,
      crop,
      category,
      severity,
      cause,
      chemicalTreatment,
      organicSolution,
      prevention,
      symptoms,
      recommendedProducts,
      stageOfOccurrence,
      isHealthy,
      tags,
    } = req.body;

    if (!name || !cause) {
      return res.status(400).json({
        message: "Disease Name and Cause are required fields.",
      });
    }

    const cropList = Array.isArray(crops) && crops.length > 0
      ? crops
      : crop
      ? [crop]
      : ["All Crops"];

    const key =
      diseaseKey ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    const existing = await PlantDiseaseAdvisory.findOne({ diseaseKey: key });
    if (existing) {
      return res.status(400).json({
        message: `A disease advisory with key "${key}" already exists.`,
      });
    }

    const created = await PlantDiseaseAdvisory.create({
      diseaseKey: key,
      name: name.trim(),
      scientificName: req.body.scientificName || "",
      crops: cropList,
      crop: cropList[0],
      category: category || "fungal",
      severity: severity || "medium",
      isHealthy: Boolean(isHealthy),
      stageOfOccurrence: stageOfOccurrence || "All Stages",
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      cause: cause.trim(),
      chemicalTreatment: chemicalTreatment || "",
      organicSolution: organicSolution || "",
      prevention: prevention || "",
      recommendedProducts: Array.isArray(recommendedProducts)
        ? recommendedProducts
        : [],
      tags: Array.isArray(tags) ? tags : [name.trim(), key],
      active: true,
    });

    res.status(201).json({
      success: true,
      message: `Disease advisory for "${name}" created successfully`,
      disease: created,
    });
  } catch (error) {
    console.error("createAdminDiseaseAdvisory error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin: Update Disease Advisory
 */
export const updateAdminDiseaseAdvisory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PlantDiseaseAdvisory.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Disease advisory not found" });
    }

    res.json({
      success: true,
      message: "Disease advisory updated successfully",
      disease: updated,
    });
  } catch (error) {
    console.error("updateAdminDiseaseAdvisory error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin: Delete Disease Advisory
 */
export const deleteAdminDiseaseAdvisory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PlantDiseaseAdvisory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Disease advisory not found" });
    }

    res.json({
      success: true,
      message: `Disease advisory for "${deleted.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("deleteAdminDiseaseAdvisory error:", error);
    res.status(500).json({ message: error.message });
  }
};
