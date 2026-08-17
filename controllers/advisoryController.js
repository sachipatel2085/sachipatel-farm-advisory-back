import AdvisoryRule from "../models/AdvisoryRule.js";
import Crop from "../models/Crop.js";
import Expense from "../models/Expense.js";
import Field from "../models/Field.js";
import Farm from "../models/Farm.js";

/* Helper: crop age */
const getCropAge = (sowingDate) => {
  return Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24));
};

/* Advisory API */
export const getAdvisoryForCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const field = await Field.findById(crop.field);
    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const cropAge = getCropAge(crop.sowingDate);

    const rules = await AdvisoryRule.find({
      cropName: crop.cropName,
      minDay: { $lte: cropAge },
      maxDay: { $gte: cropAge },
      active: true
    });

    // Check recent spray/fertilizer (last 7 days)
    const recentExpenses = await Expense.find({
      crop: crop._id,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const hasRecentSpray = recentExpenses.some(e => e.category === "spray");
    const hasRecentFertilizer = recentExpenses.some(e => e.category === "fertilizer");

    const matchedAdvisories = rules.filter(rule => {
      if (rule.soilType && rule.soilType !== field.soilType) return false;

      if (rule.conditions?.recentSpray && !hasRecentSpray) return false;
      if (rule.conditions?.recentFertilizer && !hasRecentFertilizer) return false;

      return true;
    });
    if (matchedAdvisories.length === 0) {
  matchedAdvisories.push({
    message: "Crop is healthy. Continue regular monitoring.",
    priority: "green"
  });
}

    res.json({
      cropAgeDays: cropAge,
      advisories: matchedAdvisories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
