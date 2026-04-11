import Profit from "../models/Profit.js";
import Expense from "../models/Expense.js";
import Crop from "../models/Crop.js";
import Field from "../models/Field.js";
import Farm from "../models/Farm.js";

/* Create profit record after harvest */
export const createProfitRecord = async (req, res) => {
  try {
    const { cropId, sellingPricePerUnit, successLevel, seasonYear } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const field = await Field.findById(crop.field);
    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Calculate total expense
    const expenses = await Expense.find({ crop: cropId });
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (!crop.actualYield) {
      return res.status(400).json({ message: "Actual yield not recorded yet" });
    }

    const totalIncome = crop.actualYield * sellingPricePerUnit;
    const profit = totalIncome - totalExpense;

    const profitRecord = await Profit.create({
      crop: cropId,
      field: crop.field,
      totalExpense,
      totalIncome,
      profit,
      sellingPricePerUnit,
      successLevel,
      seasonYear
    });

    res.status(201).json(profitRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get profit record for a crop */
export const getProfitByCrop = async (req, res) => {
  try {
    const profit = await Profit.findOne({ crop: req.params.cropId });
    res.json(profit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};