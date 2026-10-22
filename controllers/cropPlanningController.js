import CropDecisionRule from "../models/CropDecisionRule.js";
import Farm from "../models/Farm.js";
import Field from "../models/Field.js";

/* Standard Agronomic Dataset for Decision Engine */
const defaultDecisionRules = [
  // 1. WHEAT
  {
    cropName: "Wheat",
    season: "rabi",
    suitableSoil: ["loam", "alluvial", "clay loam", "black"],
    waterRequirement: "medium",
    avgYieldPerAcre: 20,
    yieldUnit: "quintal",
    avgMarketPrice: 2350, // ₹ per quintal (MSP reference)
    avgCostPerAcre: 16500,
    riskLevel: "low",
    botanicalFamily: "Poaceae (Gramineae)",
    durationDays: 130,
    sowingWindow: "25 Oct - 20 Nov",
    harvestWindow: "15 Mar - 10 Apr",
    benefits: [
      "Guaranteed market absorption & government MSP procurement",
      "Low price volatility and stable returns",
      "Excellent straw biomass (bhusa) value for dairy cattle",
    ],
    drawbacks: [
      "Prone to terminal heat stress if sowing delayed past November",
      "Requires 4-5 well-timed irrigations (especially CRI stage)",
    ],
    idealSuccessors: ["Green Gram (Moong)", "Cotton", "Groundnut", "Soybean"],
    incompatibleSuccessors: ["Continuous Wheat monoculture without legume break"],
    costBreakdown: {
      seedCost: 1800,
      fertilizerCost: 4500,
      pesticideCost: 1800,
      machineryCost: 3500,
      labourCost: 3000,
      irrigationCost: 1900,
    },
  },

  // 2. MUSTARD
  {
    cropName: "Mustard",
    season: "rabi",
    suitableSoil: ["loam", "sandy loam", "alluvial", "sandy"],
    waterRequirement: "low",
    avgYieldPerAcre: 8,
    yieldUnit: "quintal",
    avgMarketPrice: 5650,
    avgCostPerAcre: 11000,
    riskLevel: "low",
    botanicalFamily: "Brassicaceae (Cruciferae)",
    durationDays: 115,
    sowingWindow: "1 Oct - 25 Oct",
    harvestWindow: "15 Feb - 5 Mar",
    benefits: [
      "Extremely low water requirement (requires only 2 irrigations)",
      "High profit margin with strong edible oil market demand",
      "Excellent catch crop that matures early",
    ],
    drawbacks: [
      "Vulnerable to mustard aphid attacks during cloudy flowering weather",
      "Susceptible to frost damage in extreme North Indian winters",
    ],
    idealSuccessors: ["Summer Moong", "Kharif Maize", "Cotton", "Pearl Millet"],
    incompatibleSuccessors: ["Cabbage", "Cauliflower", "Radish"],
    costBreakdown: {
      seedCost: 1100,
      fertilizerCost: 3200,
      pesticideCost: 1900,
      machineryCost: 2400,
      labourCost: 1800,
      irrigationCost: 600,
    },
  },

  // 3. CHICKPEA / GRAM / CHANA
  {
    cropName: "Chickpea (Gram)",
    season: "rabi",
    suitableSoil: ["black", "loam", "clay loam", "alluvial"],
    waterRequirement: "low",
    avgYieldPerAcre: 9,
    yieldUnit: "quintal",
    avgMarketPrice: 5440,
    avgCostPerAcre: 12500,
    riskLevel: "low",
    botanicalFamily: "Fabaceae (Legume)",
    durationDays: 110,
    sowingWindow: "15 Oct - 10 Nov",
    harvestWindow: "25 Feb - 20 Mar",
    benefits: [
      "Fixes 35-40 kg atmospheric nitrogen per acre, enriching soil",
      "Drought tolerant and thrives in residual moisture",
      "Reduces fertilizer requirement for the subsequent Kharif crop by 25%",
    ],
    drawbacks: [
      "Pod borer (Helicoverpa) damage during green pod stage",
      "Sensitive to excess moisture and root rot in waterlogged soils",
    ],
    idealSuccessors: ["Cotton", "Maize", "Paddy", "Sugarcane"],
    incompatibleSuccessors: ["Pigeonpea (Tur)", "Lentils"],
    costBreakdown: {
      seedCost: 2200,
      fertilizerCost: 2600,
      pesticideCost: 2400,
      machineryCost: 2500,
      labourCost: 2000,
      irrigationCost: 800,
    },
  },

  // 4. POTATO
  {
    cropName: "Potato",
    season: "rabi",
    suitableSoil: ["loam", "sandy loam", "alluvial"],
    waterRequirement: "high",
    avgYieldPerAcre: 110,
    yieldUnit: "quintal",
    avgMarketPrice: 1150,
    avgCostPerAcre: 42000,
    riskLevel: "medium",
    botanicalFamily: "Solanaceae",
    durationDays: 95,
    sowingWindow: "15 Oct - 10 Nov",
    harvestWindow: "20 Jan - 20 Feb",
    benefits: [
      "Very high gross revenue and cash income per acre",
      "Short 90-100 day duration allows 3-crop annual rotation",
      "Leaves deep loosened soil with high residual fertility",
    ],
    drawbacks: [
      "High upfront investment in quality seed tubers",
      "High vulnerability to Late Blight epidemics during humid fog",
    ],
    idealSuccessors: ["Summer Moong", "Maize", "Groundnut", "Sesame"],
    incompatibleSuccessors: ["Tomato", "Chilli", "Brinjal", "Tobacco"],
    costBreakdown: {
      seedCost: 18000,
      fertilizerCost: 7500,
      pesticideCost: 4500,
      machineryCost: 4500,
      labourCost: 5500,
      irrigationCost: 2000,
    },
  },

  // 5. COTTON
  {
    cropName: "Cotton",
    season: "kharif",
    suitableSoil: ["black", "clay loam", "alluvial", "deep loam"],
    waterRequirement: "medium",
    avgYieldPerAcre: 10,
    yieldUnit: "quintal",
    avgMarketPrice: 7120,
    avgCostPerAcre: 24500,
    riskLevel: "medium",
    botanicalFamily: "Malvaceae",
    durationDays: 160,
    sowingWindow: "15 May - 25 Jun",
    harvestWindow: "15 Oct - 30 Dec",
    benefits: [
      "Premier commercial cash crop with continuous picking income",
      "Deep taproot system opens hard subsoil layers",
      "Thrives in hot sunny semi-arid climates",
    ],
    drawbacks: [
      "Pink bollworm and whitefly pressure require strict scouting",
      "Long duration ties up the field for 5 to 6 months",
    ],
    idealSuccessors: ["Rabi Wheat", "Chickpea", "Mustard", "Garlic"],
    incompatibleSuccessors: ["Okra (Bhindi)", "Hibiscus"],
    costBreakdown: {
      seedCost: 2400,
      fertilizerCost: 6500,
      pesticideCost: 5500,
      machineryCost: 3500,
      labourCost: 5000,
      irrigationCost: 1600,
    },
  },

  // 6. PADDY / RICE
  {
    cropName: "Paddy (Rice)",
    season: "kharif",
    suitableSoil: ["clay loam", "alluvial", "clay", "silt loam"],
    waterRequirement: "high",
    avgYieldPerAcre: 25,
    yieldUnit: "quintal",
    avgMarketPrice: 2320,
    avgCostPerAcre: 21500,
    riskLevel: "low",
    botanicalFamily: "Poaceae (Gramineae)",
    durationDays: 125,
    sowingWindow: "15 Jun - 15 Jul",
    harvestWindow: "15 Oct - 15 Nov",
    benefits: [
      "Staple cereal with guaranteed government MSP procurement",
      "Tolerates heavy monsoon downpours and low-lying waterlogged soils",
    ],
    drawbacks: [
      "Huge water footprint (requires flooded standing water)",
      "Puddling damages soil structure for subsequent non-rice crops",
    ],
    idealSuccessors: ["Rabi Wheat", "Mustard", "Chickpea", "Lentil"],
    incompatibleSuccessors: ["Continuous triple-paddy without aeration"],
    costBreakdown: {
      seedCost: 1400,
      fertilizerCost: 5500,
      pesticideCost: 3200,
      machineryCost: 4400,
      labourCost: 5000,
      irrigationCost: 2000,
    },
  },

  // 7. SOYBEAN
  {
    cropName: "Soybean",
    season: "kharif",
    suitableSoil: ["black", "clay loam", "loam"],
    waterRequirement: "medium",
    avgYieldPerAcre: 10,
    yieldUnit: "quintal",
    avgMarketPrice: 4892,
    avgCostPerAcre: 14000,
    riskLevel: "low",
    botanicalFamily: "Fabaceae (Legume)",
    durationDays: 95,
    sowingWindow: "20 Jun - 10 Jul",
    harvestWindow: "25 Sep - 15 Oct",
    benefits: [
      "Nitrogen-fixing legume; leaves soil rich for Rabi wheat",
      "Short duration (90-95 days) ensures timely Rabi sowing",
      "Steady demand from soy-oil extractors and poultry meal feed",
    ],
    drawbacks: [
      "Sensitive to dry spells during pod-filling and flowering",
      "Stem fly and girdle beetle require early monitoring",
    ],
    idealSuccessors: ["Rabi Wheat", "Mustard", "Garlic", "Chickpea"],
    incompatibleSuccessors: ["Pigeonpea", "Urad"],
    costBreakdown: {
      seedCost: 2800,
      fertilizerCost: 3200,
      pesticideCost: 2400,
      machineryCost: 2600,
      labourCost: 2200,
      irrigationCost: 800,
    },
  },

  // 8. MAIZE / CORN
  {
    cropName: "Maize (Corn)",
    season: "kharif",
    suitableSoil: ["loam", "alluvial", "red loam", "sandy loam"],
    waterRequirement: "medium",
    avgYieldPerAcre: 28,
    yieldUnit: "quintal",
    avgMarketPrice: 2090,
    avgCostPerAcre: 17500,
    riskLevel: "low",
    botanicalFamily: "Poaceae (Gramineae)",
    durationDays: 105,
    sowingWindow: "15 Jun - 10 Jul",
    harvestWindow: "25 Sep - 25 Oct",
    benefits: [
      "High biomass and heavy yield potential per acre",
      "Robust industrial demand for starch, poultry feed, and ethanol",
      "Fits perfectly in crop rotation before potato or wheat",
    ],
    drawbacks: [
      "Fall Armyworm (FAW) can decimate whorls if untreated",
      "Heavy nitrogen consumer",
    ],
    idealSuccessors: ["Potato", "Mustard", "Gram", "Winter Vegetables"],
    incompatibleSuccessors: ["Sorghum (Jowar)"],
    costBreakdown: {
      seedCost: 2200,
      fertilizerCost: 5200,
      pesticideCost: 2600,
      machineryCost: 3200,
      labourCost: 3100,
      irrigationCost: 1200,
    },
  },

  // 9. TOMATO (Kharif/Rabi)
  {
    cropName: "Tomato",
    season: "kharif",
    suitableSoil: ["loam", "red loam", "black", "alluvial"],
    waterRequirement: "medium",
    avgYieldPerAcre: 180,
    yieldUnit: "quintal",
    avgMarketPrice: 1450,
    avgCostPerAcre: 52000,
    riskLevel: "medium",
    botanicalFamily: "Solanaceae",
    durationDays: 130,
    sowingWindow: "15 Jun - 15 Jul",
    harvestWindow: "15 Sep - 15 Nov",
    benefits: [
      "Highest cash flow potential per unit land area",
      "Continuous harvests every 4-5 days over 6-8 weeks",
    ],
    drawbacks: [
      "High input cost for staking, fertilizers, and sprays",
      "Perishable produce subject to volatile Mandi spot prices",
    ],
    idealSuccessors: ["Legumes / French Beans", "Maize", "Cabbage"],
    incompatibleSuccessors: ["Potato", "Chilli", "Brinjal"],
    costBreakdown: {
      seedCost: 6500,
      fertilizerCost: 11000,
      pesticideCost: 9500,
      machineryCost: 5000,
      labourCost: 16000,
      irrigationCost: 4000,
    },
  },

  // 10. GREEN GRAM / MOONG (Summer Catch Crop)
  {
    cropName: "Green Gram (Moong)",
    season: "summer",
    suitableSoil: ["loam", "sandy loam", "alluvial", "black"],
    waterRequirement: "low",
    avgYieldPerAcre: 6,
    yieldUnit: "quintal",
    avgMarketPrice: 8550,
    avgCostPerAcre: 9500,
    riskLevel: "low",
    botanicalFamily: "Fabaceae (Legume)",
    durationDays: 65,
    sowingWindow: "1 Mar - 10 Apr",
    harvestWindow: "10 May - 15 Jun",
    benefits: [
      "Super short 65-day catch crop between Rabi wheat and Kharif sowing",
      "Increases soil organic nitrogen by 30-35 kg/acre",
      "High market price for Moong Dal with low capital investment",
    ],
    drawbacks: [
      "Yellow Mosaic Virus (YMV) transmitted by whiteflies",
      "Pod shattering if harvest is delayed in hot summer sun",
    ],
    idealSuccessors: ["Kharif Paddy", "Cotton", "Maize", "Bajra"],
    incompatibleSuccessors: ["Black Gram (Urad)"],
    costBreakdown: {
      seedCost: 1600,
      fertilizerCost: 1800,
      pesticideCost: 1600,
      machineryCost: 2000,
      labourCost: 1500,
      irrigationCost: 1000,
    },
  },
];

/* Auto-seed rules on startup or first query if empty */
export const seedCropDecisionRules = async () => {
  try {
    const count = await CropDecisionRule.countDocuments();
    if (count > 0) return;

    await CropDecisionRule.insertMany(defaultDecisionRules);
    console.log("Successfully seeded CropDecisionRule agronomic database.");
  } catch (err) {
    console.warn("seedCropDecisionRules error:", err.message);
  }
};

/* 1. Pre-Sowing Decision Recommendations API */
export const getPreSowingRecommendations = async (req, res) => {
  try {
    await seedCropDecisionRules();

    const {
      soilType,
      waterAvailability,
      season,
      acres,
      riskTolerance,
      budget,
      fieldId,
      farmId,
    } = req.body;

    let activeSoil = (soilType || "").toLowerCase().trim();
    let activeWater = (waterAvailability || "").toLowerCase().trim();
    let activeSeason = (season || "kharif").toLowerCase().trim();
    const farmAcres = Math.max(0.5, Number(acres) || 1);
    const userRisk = (riskTolerance || "medium").toLowerCase().trim();

    // If fieldId was provided, resolve soil/irrigation from DB
    if (fieldId) {
      const field = await Field.findById(fieldId);
      if (field) {
        if (!activeSoil && field.soilType) activeSoil = field.soilType.toLowerCase();
        if (!activeWater && field.irrigationType) activeWater = field.irrigationType.toLowerCase();
      }
    }

    // If farmId was provided and still missing attributes
    if (farmId && (!activeSoil || !activeWater)) {
      const farm = await Farm.findById(farmId);
      if (farm) {
        if (!activeSoil && farm.soilType) activeSoil = farm.soilType.toLowerCase();
        if (!activeWater && farm.irrigationType) activeWater = farm.irrigationType.toLowerCase();
      }
    }

    // Query candidates for the requested season (or all rules if season is 'all')
    const seasonQuery = activeSeason === "all" ? {} : { season: activeSeason };
    let candidates = await CropDecisionRule.find(seasonQuery).lean();

    if (candidates.length === 0) {
      // Fallback to all rules
      candidates = await CropDecisionRule.find().lean();
    }

    // Score and rank candidates based on scientific compatibility
    const rankedResults = candidates.map((rule) => {
      let score = 70; // baseline
      const reasons = [];

      // 1. Soil Match Check
      const soils = (rule.suitableSoil || []).map((s) => s.toLowerCase());
      if (activeSoil) {
        const isSoilMatch = soils.some((s) => activeSoil.includes(s) || s.includes(activeSoil));
        if (isSoilMatch) {
          score += 15;
          reasons.push(`Optimal soil synergy with ${activeSoil} soil`);
        } else {
          score -= 15;
          reasons.push(`Sub-optimal match for ${activeSoil} soil`);
        }
      }

      // 2. Water Requirement Match
      if (activeWater) {
        if (
          (activeWater.includes("high") || activeWater.includes("drip") || activeWater.includes("canal")) &&
          rule.waterRequirement === "high"
        ) {
          score += 15;
          reasons.push("Abundant irrigation fulfills high moisture needs");
        } else if (
          (activeWater.includes("low") || activeWater.includes("rainfed") || activeWater.includes("dry")) &&
          rule.waterRequirement === "high"
        ) {
          score -= 30;
          reasons.push("High water requirement risks drought stress under limited water");
        } else if (
          (activeWater.includes("low") || activeWater.includes("rainfed")) &&
          rule.waterRequirement === "low"
        ) {
          score += 18;
          reasons.push("Drought-resilient crop well suited for low water availability");
        } else {
          score += 5;
        }
      }

      // 3. Risk Tolerance Alignment
      if (userRisk === "low" && rule.riskLevel === "low") {
        score += 10;
        reasons.push("Low agronomic & price volatility matches your low risk profile");
      } else if (userRisk === "low" && rule.riskLevel === "high") {
        score -= 20;
        reasons.push("High market fluctuation exceeds your conservative risk preference");
      } else if (userRisk === "high" && rule.riskLevel === "high") {
        score += 10;
        reasons.push("High reward potential matches your progressive risk profile");
      }

      // Financial Projections for given acreage
      const totalCost = Math.round(rule.avgCostPerAcre * farmAcres);
      const grossRevenue = Math.round(rule.avgYieldPerAcre * rule.avgMarketPrice * farmAcres);
      const netProfit = grossRevenue - totalCost;
      const profitPerAcre = Math.round(netProfit / farmAcres);
      const roiPercent = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

      // Budget check
      if (budget && Number(budget) > 0) {
        const userBudget = Number(budget);
        if (totalCost > userBudget) {
          score -= 15;
          reasons.push(`Requires ₹${totalCost.toLocaleString("en-IN")}, exceeding your ₹${userBudget.toLocaleString("en-IN")} budget`);
        } else {
          score += 5;
          reasons.push(`Fits comfortably within your ₹${userBudget.toLocaleString("en-IN")} investment budget`);
        }
      }

      const clampedScore = Math.max(25, Math.min(98, score));

      return {
        cropName: rule.cropName,
        season: rule.season,
        botanicalFamily: rule.botanicalFamily,
        durationDays: rule.durationDays,
        sowingWindow: rule.sowingWindow,
        harvestWindow: rule.harvestWindow,
        suitabilityScore: clampedScore,
        suitabilityRating: clampedScore >= 80 ? "Highly Recommended" : clampedScore >= 60 ? "Viable Option" : "Marginal",
        financials: {
          acres: farmAcres,
          expectedYieldTotal: Math.round(rule.avgYieldPerAcre * farmAcres * 10) / 10,
          yieldPerAcre: rule.avgYieldPerAcre,
          yieldUnit: rule.yieldUnit || "quintal",
          marketPricePerUnit: rule.avgMarketPrice,
          estimatedTotalCost: totalCost,
          costPerAcre: rule.avgCostPerAcre,
          grossRevenue,
          netProfit,
          profitPerAcre,
          roiPercent,
        },
        agronomy: {
          waterRequirement: rule.waterRequirement,
          riskLevel: rule.riskLevel,
          suitableSoil: rule.suitableSoil,
          benefits: rule.benefits || [],
          drawbacks: rule.drawbacks || [],
          idealSuccessors: rule.idealSuccessors || [],
        },
        costBreakdown: rule.costBreakdown || {},
        reasons: reasons.slice(0, 3),
      };
    });

    rankedResults.sort((a, b) => b.suitabilityScore - a.suitabilityScore || b.financials.netProfit - a.financials.netProfit);

    res.json({
      query: {
        season: activeSeason,
        soilType: activeSoil || "General Loam",
        waterAvailability: activeWater || "Medium",
        acres: farmAcres,
        riskTolerance: userRisk,
      },
      totalEvaluated: rankedResults.length,
      recommendations: rankedResults,
    });
  } catch (error) {
    console.error("getPreSowingRecommendations error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 2. Crop Rotation Planner API */
export const getCropRotationPlan = async (req, res) => {
  try {
    await seedCropDecisionRules();

    const { currentCrop, nextSeason, soilType } = req.body;
    if (!currentCrop) {
      return res.status(400).json({ message: "currentCrop is required." });
    }

    const allRules = await CropDecisionRule.find().lean();
    const cleanCurrent = currentCrop.toLowerCase().trim();

    // Find rule for current crop if available
    const matchedRule = allRules.find(
      (r) =>
        r.cropName.toLowerCase() === cleanCurrent ||
        cleanCurrent.includes(r.cropName.toLowerCase()) ||
        r.cropName.toLowerCase().includes(cleanCurrent)
    );

    const family = matchedRule?.botanicalFamily || "General";
    const season = (nextSeason || "rabi").toLowerCase();

    // Rotation evaluation rules
    const candidates = allRules.filter((r) => {
      if (nextSeason && nextSeason !== "all" && r.season !== season) {
        return false;
      }
      return true;
    });

    const evaluatedSuccessors = candidates.map((cand) => {
      let rotationalScore = 75;
      const benefits = [];
      const warnings = [];

      const isSameFamily =
        family !== "General" &&
        cand.botanicalFamily &&
        cand.botanicalFamily.toLowerCase() === family.toLowerCase();

      if (isSameFamily) {
        rotationalScore -= 45;
        warnings.push(
          `Same family (${family}): Continuous cultivation causes severe accumulation of soil-borne pathogens, nematodes, and root rots.`
        );
      } else {
        rotationalScore += 15;
      }

      // Legume synergy
      const isCurrentLegume = family.includes("Fabaceae") || family.includes("Legume");
      const isCandLegume =
        cand.botanicalFamily.includes("Fabaceae") ||
        cand.botanicalFamily.includes("Legume");

      if (isCurrentLegume && !isCandLegume) {
        rotationalScore += 20;
        benefits.push(
          `Feeds on residual nitrogen fixed by previous ${currentCrop} crop, saving up to 25% urea costs.`
        );
      } else if (!isCurrentLegume && isCandLegume) {
        rotationalScore += 25;
        benefits.push(
          `Acts as biological nitrogen-fixer, restoring exhausted organic nitrogen and breaking cereal weed cycles.`
        );
      }

      // Root zone depth diversity (Deep taproot vs Fibrous roots)
      if (cleanCurrent.includes("cotton") && cand.cropName.toLowerCase().includes("wheat")) {
        rotationalScore += 20;
        benefits.push(
          "Fibrous root system of Wheat utilizes upper soil horizon while Cotton subsoil drainage benefits wheat root run."
        );
      }

      // Pest cycle break
      if (cand.idealSuccessors && cand.idealSuccessors.some((s) => s.toLowerCase().includes(cleanCurrent))) {
        rotationalScore += 15;
        benefits.push("Scientifically recognized ideal rotational partner.");
      }

      const clampedScore = Math.max(20, Math.min(99, rotationalScore));

      return {
        cropName: cand.cropName,
        season: cand.season,
        botanicalFamily: cand.botanicalFamily,
        durationDays: cand.durationDays,
        rotationalScore: clampedScore,
        suitability: clampedScore >= 80 ? "Highly Recommended" : clampedScore >= 60 ? "Acceptable" : "Not Recommended",
        soilHealthImpact: isCandLegume ? "+35 kg Soil Nitrogen / acre" : "Balanced Nutrient Uptake",
        benefits: benefits.length > 0 ? benefits : cand.benefits.slice(0, 2),
        warnings,
        avgProfitPerAcre: Math.round(cand.avgYieldPerAcre * cand.avgMarketPrice - cand.avgCostPerAcre),
      };
    });

    evaluatedSuccessors.sort((a, b) => b.rotationalScore - a.rotationalScore);

    // Build standard multi-season annual roadmap based on current crop
    let suggestedAnnualRoadmap = [];
    if (cleanCurrent.includes("cotton")) {
      suggestedAnnualRoadmap = [
        { season: "Kharif (Monsoon)", crop: "Cotton", role: "Main Cash Crop" },
        { season: "Rabi (Winter)", crop: "Wheat or Mustard", role: "Cereal Grain & Oilseed" },
        { season: "Summer (Zaid)", crop: "Green Gram (Moong)", role: "Soil Restorer Legume" },
      ];
    } else if (cleanCurrent.includes("rice") || cleanCurrent.includes("paddy")) {
      suggestedAnnualRoadmap = [
        { season: "Kharif (Monsoon)", crop: "Paddy", role: "Staple Cereal" },
        { season: "Rabi (Winter)", crop: "Mustard or Chickpea", role: "Low-water Legume / Oilseed" },
        { season: "Summer (Zaid)", crop: "Summer Moong or Fallow", role: "Green Manuring" },
      ];
    } else if (cleanCurrent.includes("tomato") || cleanCurrent.includes("potato")) {
      suggestedAnnualRoadmap = [
        { season: "Rabi (Winter)", crop: "Potato", role: "High-value Cash Crop" },
        { season: "Summer (Zaid)", crop: "Green Gram (Moong)", role: "Soil Nitrogen Fixer & Pest Break" },
        { season: "Kharif (Monsoon)", crop: "Maize or Soybean", role: "Non-Solanaceous Biomass Builder" },
      ];
    } else {
      suggestedAnnualRoadmap = [
        { season: "Kharif (Monsoon)", crop: "Soybean / Maize", role: "Legume / Coarse Grain" },
        { season: "Rabi (Winter)", crop: "Wheat", role: "Primary Winter Cereal" },
        { season: "Summer (Zaid)", crop: "Summer Moong", role: "Nitrogen Fixation Catch Crop" },
      ];
    }

    res.json({
      currentCrop,
      botanicalFamily: family,
      recommendedSuccessors: evaluatedSuccessors.filter((s) => s.rotationalScore >= 60),
      incompatibleSuccessors: evaluatedSuccessors.filter((s) => s.rotationalScore < 60),
      annualRoadmap: suggestedAnnualRoadmap,
    });
  } catch (error) {
    console.error("getCropRotationPlan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 3. Input Cost Estimator API */
export const estimateInputCosts = async (req, res) => {
  try {
    await seedCropDecisionRules();

    const { cropName, acres, customOverrides } = req.body;
    if (!cropName) {
      return res.status(400).json({ message: "cropName is required." });
    }

    const farmAcres = Math.max(0.5, Number(acres) || 1);
    const cleanName = cropName.toLowerCase().trim();

    const allRules = await CropDecisionRule.find().lean();
    const rule =
      allRules.find(
        (r) =>
          r.cropName.toLowerCase() === cleanName ||
          cleanName.includes(r.cropName.toLowerCase()) ||
          r.cropName.toLowerCase().includes(cleanName)
      ) || allRules[0];

    const base = rule.costBreakdown || {
      seedCost: 2000,
      fertilizerCost: 4000,
      pesticideCost: 3000,
      machineryCost: 3500,
      labourCost: 4500,
      irrigationCost: 1500,
    };

    // Apply any farmer overrides per acre
    const seedPerAcre = customOverrides?.seedCost !== undefined ? Number(customOverrides.seedCost) : base.seedCost;
    const fertPerAcre = customOverrides?.fertilizerCost !== undefined ? Number(customOverrides.fertilizerCost) : base.fertilizerCost;
    const sprayPerAcre = customOverrides?.pesticideCost !== undefined ? Number(customOverrides.pesticideCost) : base.pesticideCost;
    const machPerAcre = customOverrides?.machineryCost !== undefined ? Number(customOverrides.machineryCost) : base.machineryCost;
    const labourPerAcre = customOverrides?.labourCost !== undefined ? Number(customOverrides.labourCost) : base.labourCost;
    const irrPerAcre = customOverrides?.irrigationCost !== undefined ? Number(customOverrides.irrigationCost) : base.irrigationCost;

    const totalCostPerAcre = seedPerAcre + fertPerAcre + sprayPerAcre + machPerAcre + labourPerAcre + irrPerAcre;
    const totalFarmCost = Math.round(totalCostPerAcre * farmAcres);

    // Yield & break-even calculation
    const expectedYieldTotal = Math.round(rule.avgYieldPerAcre * farmAcres * 10) / 10;
    const grossIncome = Math.round(expectedYieldTotal * rule.avgMarketPrice);
    const projectedProfit = grossIncome - totalFarmCost;
    const breakEvenYieldTotal = rule.avgMarketPrice > 0 ? Math.round((totalFarmCost / rule.avgMarketPrice) * 10) / 10 : 0;
    const breakEvenYieldPerAcre = Math.round((breakEvenYieldTotal / farmAcres) * 10) / 10;

    res.json({
      cropName: rule.cropName,
      season: rule.season,
      acres: farmAcres,
      marketPricePerUnit: rule.avgMarketPrice,
      yieldUnit: rule.yieldUnit || "quintal",
      costPerAcre: {
        seeds: seedPerAcre,
        fertilizers: fertPerAcre,
        pesticides: sprayPerAcre,
        machinery: machPerAcre,
        labour: labourPerAcre,
        irrigation: irrPerAcre,
        total: totalCostPerAcre,
      },
      totalFarmCosts: {
        seeds: Math.round(seedPerAcre * farmAcres),
        fertilizers: Math.round(fertPerAcre * farmAcres),
        pesticides: Math.round(sprayPerAcre * farmAcres),
        machinery: Math.round(machPerAcre * farmAcres),
        labour: Math.round(labourPerAcre * farmAcres),
        irrigation: Math.round(irrPerAcre * farmAcres),
        grandTotal: totalFarmCost,
      },
      projections: {
        expectedYieldTotal,
        grossIncome,
        projectedProfit,
        roiPercent: totalFarmCost > 0 ? Math.round((projectedProfit / totalFarmCost) * 100) : 0,
        breakEvenYieldTotal,
        breakEvenYieldPerAcre,
        safetyMarginQuintals: Math.round((expectedYieldTotal - breakEvenYieldTotal) * 10) / 10,
      },
    });
  } catch (error) {
    console.error("estimateInputCosts error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 4. Agronomic Sowing Calendar API */
export const getAgronomicCalendar = async (req, res) => {
  try {
    await seedCropDecisionRules();
    const rules = await CropDecisionRule.find().sort({ season: 1, cropName: 1 }).lean();

    const calendarBySeason = {
      kharif: [],
      rabi: [],
      summer: [],
    };

    rules.forEach((r) => {
      const item = {
        cropName: r.cropName,
        family: r.botanicalFamily,
        durationDays: r.durationDays,
        sowingWindow: r.sowingWindow,
        harvestWindow: r.harvestWindow,
        waterRequirement: r.waterRequirement,
        avgYield: `${r.avgYieldPerAcre} ${r.yieldUnit}/acre`,
        avgProfitPerAcre: Math.round(r.avgYieldPerAcre * r.avgMarketPrice - r.avgCostPerAcre),
      };

      if (calendarBySeason[r.season]) {
        calendarBySeason[r.season].push(item);
      }
    });

    res.json({
      seasons: [
        {
          id: "kharif",
          name: "Kharif Season (Monsoon)",
          months: "June – October",
          description: "Relies on South-West monsoon rainfall; warm, humid tropical conditions.",
          crops: calendarBySeason.kharif,
        },
        {
          id: "rabi",
          name: "Rabi Season (Winter)",
          months: "October – March / April",
          description: "Sown at the onset of cool autumn/winter; harvested in spring.",
          crops: calendarBySeason.rabi,
        },
        {
          id: "summer",
          name: "Zaid / Summer Season",
          months: "March – June",
          description: "Short transition window between winter and monsoon; requires assured irrigation.",
          crops: calendarBySeason.summer,
        },
      ],
    });
  } catch (error) {
    console.error("getAgronomicCalendar error:", error);
    res.status(500).json({ message: error.message });
  }
};
