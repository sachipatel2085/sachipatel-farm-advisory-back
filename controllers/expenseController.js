import Expense from "../models/Expense.js";
import Crop from "../models/Crop.js";
import Field from "../models/Field.js";
import Farm from "../models/Farm.js";

/* Add expense */
export const createExpense = async (req, res) => {
  try {
    const { cropId, category, description, amount, date } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const field = await Field.findById(crop.field);
    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const expense = await Expense.create({
      crop: cropId,
      field: crop.field,
      category,
      description,
      amount,
      date
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get expenses of a crop */
export const getExpensesByCrop = async (req, res) => {
  try {
    const expenses = await Expense.find({ crop: req.params.cropId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get total expense of a crop */
export const getCropExpenseTotal = async (req, res) => {
  try {
    const expenses = await Expense.find({ crop: req.params.cropId });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ totalExpense: total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Delete expense */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const field = await Field.findById(expense.field);
    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};