import AdvisoryRule from "../models/AdvisoryRule.js";
import Crop from "../models/Crop.js";
import Expense from "../models/Expense.js";
import Field from "../models/Field.js";
import Farm from "../models/Farm.js";
import { buildIdOrSlugQuery } from "../utils/slugify.js";

/* Helper: Calculate crop age in days */
const getCropAge = (sowingDate) => {
  return Math.max(
    0,
    Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24))
  );
};

/* Helper: Determine crop growth stage */
const getGrowthStageInfo = (ageDays, durationDays = 120) => {
  const percent = durationDays > 0 ? (ageDays / durationDays) * 100 : 0;

  if (percent < 25) {
    return { stage: "early", label: "Seedling & Establishment Stage", percent: Math.round(percent) };
  }
  if (percent < 55) {
    return { stage: "vegetative", label: "Active Vegetative Growth", percent: Math.round(percent) };
  }
  if (percent < 80) {
    return { stage: "flowering", label: "Flowering & Fruit/Pod Development", percent: Math.round(percent) };
  }
  return { stage: "harvest", label: "Maturity & Harvest Preparation", percent: Math.min(100, Math.round(percent)) };
};

/* Auto-seed default rules if database is empty */
export const seedDefaultAdvisoryRules = async () => {
  try {
    const count = await AdvisoryRule.countDocuments();
    if (count > 0) return;

    const defaultRules = [
      // Tomato rules
      {
        cropName: "Tomato",
        minDay: 0,
        maxDay: 25,
        message: "Apply balanced NPK basal dose and ensure light, frequent irrigation to encourage root establishment.",
        priority: "green",
        category: "nutrition",
      },
      {
        cropName: "Tomato",
        minDay: 26,
        maxDay: 55,
        message: "Scout underside of leaves for whiteflies and aphids. Apply neem oil (5ml/L) if sucking pests are spotted.",
        priority: "yellow",
        category: "pest",
      },
      {
        cropName: "Tomato",
        minDay: 56,
        maxDay: 85,
        message: "Critical flowering stage: Prevent moisture stress. Spray 0:52:34 with Boron to minimize flower drop.",
        priority: "red",
        category: "flowering",
      },
      {
        cropName: "Tomato",
        minDay: 86,
        maxDay: 130,
        message: "Harvest tomatoes at breaker/pink stage for distant markets. Withhold irrigation 3 days before picking.",
        priority: "green",
        category: "harvest",
      },

      // Wheat rules
      {
        cropName: "Wheat",
        minDay: 20,
        maxDay: 25,
        message: "Crown Root Initiation (CRI) stage: First and most critical irrigation must be provided now.",
        priority: "red",
        category: "irrigation",
      },
      {
        cropName: "Wheat",
        minDay: 40,
        maxDay: 45,
        message: "Tillering stage: Apply second irrigation and top-dress remaining Nitrogen/Urea.",
        priority: "yellow",
        category: "nutrition",
      },
      {
        cropName: "Wheat",
        minDay: 80,
        maxDay: 95,
        message: "Flowering & milking stage: Ensure optimal soil moisture. Inspect for yellow rust pustules on leaves.",
        priority: "yellow",
        category: "disease",
      },

      // Cotton rules
      {
        cropName: "Cotton",
        minDay: 30,
        maxDay: 60,
        message: "Square formation stage: Monitor for pink bollworm and whitefly. Install pheromone traps (5 traps/acre).",
        priority: "yellow",
        category: "pest",
      },
      {
        cropName: "Cotton",
        minDay: 61,
        maxDay: 100,
        message: "Peak flowering & boll development: Foliar spray of Potassium Nitrate (13:0:45) at 1% to boost boll size.",
        priority: "green",
        category: "nutrition",
      },

      // Potato rules
      {
        cropName: "Potato",
        minDay: 0,
        maxDay: 30,
        message: "Sprouting & emergence stage: Provide light irrigation and scout for black scurf or cutworms.",
        priority: "green",
        category: "irrigation",
      },
      {
        cropName: "Potato",
        minDay: 31,
        maxDay: 75,
        message: "Critical tuber bulking stage: High risk of Late Blight in foggy or overcast weather. Spray Mancozeb 75% WP @ 2.5g/L preventatively.",
        priority: "red",
        category: "disease",
      },

      // Rice rules
      {
        cropName: "Rice",
        minDay: 10,
        maxDay: 40,
        message: "Active tillering: Maintain 2-3 cm standing water. Apply top-dress Urea and monitor for Yellow Stem Borer dead-hearts.",
        priority: "yellow",
        category: "nutrition",
      },
      {
        cropName: "Rice",
        minDay: 60,
        maxDay: 90,
        message: "Panicle initiation & flowering: Keep soil saturated. Inspect lower leaf sheaths for Sheath Blight lesions.",
        priority: "red",
        category: "disease",
      },
    ];

    await AdvisoryRule.insertMany(defaultRules);
    console.log("Seeded initial standard agricultural advisory rules.");
  } catch (err) {
    console.warn("Advisory rules auto-seed error:", err.message);
  }
};

/* Core logic: compute advisories for a given crop, farm, and optional field */
export const computeAdvisoriesForCropData = async (crop, farm, field) => {
  const cropAge = getCropAge(crop.sowingDate);
  const durationDays = crop.expectedDurationDays || 120;
  const stageInfo = getGrowthStageInfo(cropAge, durationDays);

  // Check recent spray/fertilizer (last 7 days) from crop.transactions AND standalone Expense collection
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTxns = (crop.transactions || []).filter(
    (t) => new Date(t.date) >= sevenDaysAgo
  );

  const standaloneExpenses = await Expense.find({
    $or: [{ crop: crop._id }, ...(crop.field ? [{ field: crop.field }] : [])],
    date: { $gte: sevenDaysAgo },
  }).lean();

  const allRecentActivities = [...recentTxns, ...standaloneExpenses];

  const hasRecentSpray = allRecentActivities.some((e) => {
    const cat = (e.category || "").toLowerCase();
    return cat === "spray" || cat === "pesticide";
  });

  const hasRecentFertilizer = allRecentActivities.some((e) => {
    const cat = (e.category || "").toLowerCase();
    return cat === "fertilizer" || cat === "nutrition";
  });

  const activeSoil = field?.soilType || farm?.soilType;

  // 1. Check if any advisory rules exist in DB specifically for this crop (configured by Admin / Moderator)
  const cropRegex = new RegExp(`^${crop.cropName.trim()}$`, "i");
  const totalCropRules = await AdvisoryRule.countDocuments({
    cropName: cropRegex,
    active: true,
  });

  // 2. If NO advisory rules have been configured for this crop, do NOT invent fake fallbacks!
  if (totalCropRules === 0) {
    return {
      cropId: crop._id,
      cropSlug: crop.slug,
      cropName: crop.cropName,
      variety: crop.variety || "",
      farmId: farm?._id || null,
      farmSlug: farm?.slug || null,
      farmName: farm?.farmName || "Farm",
      fieldId: field?._id || null,
      fieldName: field?.name || "",
      cropAgeDays: cropAge,
      expectedDurationDays: durationDays,
      growthStage: stageInfo.stage,
      growthStageLabel: stageInfo.label,
      growthProgressPercent: stageInfo.percent,
      soilType: activeSoil || "General / Loam",
      recentActivitySummary: {
        recentSpray: hasRecentSpray,
        recentFertilizer: hasRecentFertilizer,
      },
      isAvailable: false,
      statusMessage: `Advisory is not available for ${crop.cropName}. Agronomic advisories have not been configured for this crop by administrators or moderators yet.`,
      advisories: [],
    };
  }

  // 3. Query matching rules in database for current crop age window
  const dbRules = await AdvisoryRule.find({
    cropName: cropRegex,
    minDay: { $lte: cropAge },
    maxDay: { $gte: cropAge },
    active: true,
  }).lean();

  const matchedDbAdvisories = dbRules
    .filter((rule) => {
      if (rule.soilType && activeSoil && rule.soilType !== activeSoil) {
        return false;
      }
      if (rule.conditions?.recentSpray && !hasRecentSpray) return false;
      if (rule.conditions?.recentFertilizer && !hasRecentFertilizer) return false;
      return true;
    })
    .map((r) => ({
      title: r.category ? `${r.category.toUpperCase()} Advisory` : "Crop Management",
      category: r.category || "general",
      priority: r.priority || "green",
      stage: stageInfo.label,
      message: r.message,
      recommendedAction:
        r.recommendedAction || "Follow recommended agricultural practices for optimal yield.",
      source: "APMC Advisory Rule",
    }));

  // Deduplicate
  const seen = new Set();
  const finalAdvisories = matchedDbAdvisories.filter((a) => {
    if (seen.has(a.message)) return false;
    seen.add(a.message);
    return true;
  });

  const isAvailable = true;
  const statusMessage =
    finalAdvisories.length === 0
      ? `No active advisories for ${crop.cropName} at the current growth stage (Day ${cropAge}). Check back as the crop develops.`
      : null;

  return {
    cropId: crop._id,
    cropSlug: crop.slug,
    cropName: crop.cropName,
    variety: crop.variety || "",
    farmId: farm?._id || null,
    farmSlug: farm?.slug || null,
    farmName: farm?.farmName || "Farm",
    fieldId: field?._id || null,
    fieldName: field?.name || "",
    cropAgeDays: cropAge,
    expectedDurationDays: durationDays,
    growthStage: stageInfo.stage,
    growthStageLabel: stageInfo.label,
    growthProgressPercent: stageInfo.percent,
    soilType: activeSoil || "General / Loam",
    recentActivitySummary: {
      recentSpray: hasRecentSpray,
      recentFertilizer: hasRecentFertilizer,
    },
    isAvailable,
    statusMessage,
    advisories: finalAdvisories,
  };
};

/* Single Crop Advisory API */
export const getAdvisoryForCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.cropId));
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    // Safely resolve the farm through crop.farm or optionally crop.field
    let farm = null;
    let field = null;

    if (crop.field) {
      field = await Field.findById(crop.field);
      if (field && field.farm) {
        farm = await Farm.findById(field.farm);
      }
    }

    if (!farm && crop.farm) {
      farm = await Farm.findById(crop.farm);
    }

    if (!farm) {
      return res.status(404).json({ message: "Associated farm not found" });
    }

    // Verify ownership
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const data = await computeAdvisoriesForCropData(crop, farm, field);
    res.json(data);
  } catch (error) {
    console.error("getAdvisoryForCrop error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Aggregated User Advisories across all active crops */
export const getAllUserAdvisories = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's farms
    const farms = await Farm.find({ user: userId }).lean();
    const farmIds = farms.map((f) => f._id);
    const farmMap = new Map(farms.map((f) => [f._id.toString(), f]));

    // 2. Fetch fields under user's farms
    const fields = await Field.find({ farm: { $in: farmIds } }).lean();
    const fieldIds = fields.map((f) => f._id);
    const fieldMap = new Map(fields.map((f) => [f._id.toString(), f]));

    // 3. Fetch active crops
    const crops = await Crop.find({
      $or: [
        { farm: { $in: farmIds } },
        ...(fieldIds.length ? [{ field: { $in: fieldIds } }] : []),
      ],
      status: { $ne: "harvested" },
    }).lean();

    const cropAdvisories = [];
    let urgentAlerts = 0;
    let pendingActions = 0;
    let goodPractices = 0;
    let totalAdvisories = 0;

    for (const crop of crops) {
      let farm = null;
      let field = null;

      if (crop.field) {
        field = fieldMap.get(crop.field.toString()) || null;
        if (field && field.farm) {
          farm = farmMap.get(field.farm.toString()) || null;
        }
      }
      if (!farm && crop.farm) {
        farm = farmMap.get(crop.farm.toString()) || null;
      }

      const advisoryData = await computeAdvisoriesForCropData(crop, farm, field);
      cropAdvisories.push(advisoryData);

      advisoryData.advisories.forEach((adv) => {
        totalAdvisories++;
        if (adv.priority === "red") urgentAlerts++;
        else if (adv.priority === "yellow") pendingActions++;
        else goodPractices++;
      });
    }

    res.json({
      stats: {
        totalCrops: crops.length,
        totalAdvisories,
        urgentAlerts,
        pendingActions,
        goodPractices,
      },
      crops: cropAdvisories,
    });
  } catch (error) {
    console.error("getAllUserAdvisories error:", error);
    res.status(500).json({ message: error.message });
  }
};
