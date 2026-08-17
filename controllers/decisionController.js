import { cropRules } from "../utils/cropRules.js";
import Field from "../models/Field.js";
import Farm from "../models/Farm.js";
import Profit from "../models/Profit.js";

/* Recommend crops for a field */
export const getCropRecommendations = async (req, res) => {
  try {
    const { fieldId, season, riskTolerance } = req.body;

    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ message: "Field not found" });

    const farm = await Farm.findById(field.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pastResults = await Profit.find({ field: fieldId });

    const recommendations = cropRules
      .filter(rule => rule.season === season)
      .map(rule => {
        let adjustedProfit = rule.baseProfit;

        // Boost if similar crop performed well earlier
        const past = pastResults.find(p => p.cropName === rule.crop);
        if (past && past.profit > 0) adjustedProfit += 5000;

        // Water mismatch penalty
        if (rule.waterNeed !== field.waterLevel) adjustedProfit -= 8000;

        // Risk tolerance logic
        if (riskTolerance === "low" && rule.risk > 30) adjustedProfit -= 10000;
        if (riskTolerance === "high") adjustedProfit += 3000;

        return {
          crop: rule.crop,
          expectedProfit: adjustedProfit,
          riskScore: rule.risk,
          reason: `Water: ${rule.waterNeed}, Risk: ${rule.risk}`
        };
      })
      .sort((a, b) => b.expectedProfit - a.expectedProfit)
      .slice(0, 3);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};