import Farm from "../models/Farm.js";
import Field from "../models/Field.js";
import Crop from "../models/Crop.js";
import Expense from "../models/Expense.js";
import Profit from "../models/Profit.js";

/* Main dashboard analytics */
export const getDashboardStats = async (req, res) => {
  try {
    // Get user's farms
    const farms = await Farm.find({ user: req.user._id });
    const farmIds = farms.map((f) => f._id);

    // Fields under farms
    const fields = await Field.find({ farm: { $in: farmIds } });
    const fieldIds = fields.map((f) => f._id);

    // Crops under fields
    const crops = await Crop.find({ field: { $in: fieldIds } });
    const cropIds = crops.map((c) => c._id);

    // Expenses
    const expenses = await Expense.find({ field: { $in: fieldIds } });
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Profits
    const profits = await Profit.find({ field: { $in: fieldIds } });

    const totalIncome = profits.reduce((sum, p) => sum + p.totalIncome, 0);
    const totalProfit = profits.reduce((sum, p) => sum + p.profit, 0);

    // Crop status summary
    const cropStatus = {
      growing: crops.filter((c) => c.status === "growing").length,
      harvested: crops.filter((c) => c.status === "harvested").length,
      failed: crops.filter((c) => c.status === "failed").length,
    };

    // Field-wise profit summary
    const fieldPerformance = fields.map((field) => {
      const fieldProfits = profits.filter(
        (p) => p.field.toString() === field._id.toString(),
      );

      const profitSum = fieldProfits.reduce((sum, p) => sum + p.profit, 0);

      return {
        fieldId: field._id,
        fieldName: field.fieldName,
        profit: profitSum,
      };
    });

    res.json({
      totals: {
        farms: farms.length,
        fields: fields.length,
        crops: crops.length,
        totalExpense,
        totalIncome,
        totalProfit,
      },
      cropStatus,
      fieldPerformance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
