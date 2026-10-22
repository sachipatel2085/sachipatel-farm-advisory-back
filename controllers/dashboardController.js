import Farm from "../models/Farm.js";
import Field from "../models/Field.js";
import Crop from "../models/Crop.js";
import Expense from "../models/Expense.js";

/* Helper: Human readable relative time */
const getRelativeTime = (date) => {
  if (!date) return "Recently";
  const now = new Date();
  const past = new Date(date);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMo = Math.floor(diffDays / 30);
  if (diffMo === 1) return "1 month ago";
  return `${diffMo} months ago`;
};

/* Helper: Generate last N calendar months */
const getLastMonths = (count = 6) => {
  const months = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    months.push({ key, label, income: 0, expense: 0, profit: 0 });
  }

  return months;
};

/* Main Dashboard Analytics API */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's farms
    const farms = await Farm.find({ user: userId }).lean();
    const farmIds = farms.map((f) => f._id);

    // 2. Fetch fields under user's farms
    const fields = await Field.find({ farm: { $in: farmIds } }).lean();
    const fieldIds = fields.map((f) => f._id);

    // 3. Fetch all crops belonging to user's farms OR fields
    const cropQuery = {
      $or: [
        { farm: { $in: farmIds } },
        ...(fieldIds.length ? [{ field: { $in: fieldIds } }] : []),
      ],
    };

    const crops = await Crop.find(cropQuery)
      .populate("farm", "farmName")
      .lean();

    const activeCrops = crops.filter((c) => c.status === "active");

    // 4. Aggregate Transactions & Standalone Expenses
    let totalExpense = 0;
    let totalIncome = 0;

    const monthlyMap = new Map();
    const last6Months = getLastMonths(6);
    last6Months.forEach((m) => monthlyMap.set(m.key, { ...m }));

    const activities = [];

    // Process transactions inside crops
    crops.forEach((crop) => {
      // Sowing history activity
      if (crop.sowingDate) {
        activities.push({
          id: `sow_${crop._id}`,
          text: `Planted new crop: ${crop.cropName} (${crop.variety || "Standard"})`,
          date: new Date(crop.sowingDate),
          type: "crop",
        });
      }

      // Harvests
      (crop.harvests || []).forEach((h, idx) => {
        const harvestAmount = Number(h.amount || 0);
        activities.push({
          id: `harvest_${crop._id}_${idx}`,
          text: `Harvest completed: ${h.quantity || 0} kg of ${crop.cropName} (₹${harvestAmount})`,
          date: new Date(h.date || Date.now()),
          type: "harvest",
        });
      });

      // Transactions
      (crop.transactions || []).forEach((txn) => {
        const amt = Number(txn.amount || 0);
        const txnDate = new Date(txn.date || Date.now());

        if (txn.type === "income") {
          totalIncome += amt;
        } else if (txn.type === "expense") {
          totalExpense += amt;
        }

        // Monthly bucket
        const monthKey = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap.has(monthKey)) {
          const item = monthlyMap.get(monthKey);
          if (txn.type === "income") item.income += amt;
          if (txn.type === "expense") item.expense += amt;
          item.profit = item.income - item.expense;
        }

        activities.push({
          id: `txn_${txn._id || Math.random()}`,
          text: `${txn.type === "income" ? "Income received" : "Expense recorded"}: ₹${amt} for ${txn.title || crop.cropName}`,
          date: txnDate,
          type: txn.type,
        });
      });
    });

    // Check standalone Expense collection if any exist
    const standaloneExpenses = await Expense.find({
      $or: [
        { crop: { $in: crops.map((c) => c._id) } },
        ...(fieldIds.length ? [{ field: { $in: fieldIds } }] : []),
      ],
    }).lean();

    standaloneExpenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      totalExpense += amt;

      const expDate = new Date(e.date || Date.now());
      const monthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(monthKey)) {
        const item = monthlyMap.get(monthKey);
        item.expense += amt;
        item.profit = item.income - item.expense;
      }
    });

    // Sort activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    const recentActivity = activities.slice(0, 5).map((act) => ({
      id: act.id,
      text: act.text,
      time: getRelativeTime(act.date),
      type: act.type,
    }));

    const totalProfit = totalIncome - totalExpense;
    const growth = totalIncome > 0 ? Math.round((totalProfit / totalIncome) * 100) : 0;
    const totalArea = farms.reduce((sum, f) => sum + (Number(f.totalArea) || 0), 0);

    const cropStatus = {
      active: activeCrops.length,
      harvested: crops.filter((c) => c.status === "harvested").length,
      failed: crops.filter((c) => c.status === "failed").length,
    };

    const financialTrends = Array.from(monthlyMap.values());

    res.json({
      totals: {
        farms: farms.length,
        fields: fields.length,
        crops: crops.length,
        activeCrops: activeCrops.length,
        totalArea,
        totalExpense,
        totalIncome,
        revenue: totalIncome,
        totalProfit,
        growth,
      },
      cropStatus,
      financialTrends,
      recentActivity,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: error.message });
  }
};
