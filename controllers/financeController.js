import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";
import Shop from "../models/Shop.js";
import Credit from "../models/Credit.js";
import Payment from "../models/Payment.js";

/* ===== FARM FINANCE ===== */
export const getFinanceSummary = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user._id }).select("_id");
    const farmIds = farms.map((f) => f._id);

    const crops = await Crop.find({ farm: { $in: farmIds } });

    let income = 0;
    let expense = 0;

    crops.forEach((crop) => {
      crop.transactions.forEach((t) => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      });
    });

    res.json({
      income,
      expense,
      profit: income - expense,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== SHOP SUMMARY ===== */
export const getShopSummary = async (req, res) => {
  try {
    const shops = await Shop.find({ user: req.user._id });

    const result = [];

    for (let shop of shops) {
      const credits = await Credit.find({ shop: shop._id });
      const payments = await Payment.find({ shop: shop._id });

      const totalUdhar = credits.reduce((s, c) => s + c.amount, 0);
      const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

      result.push({
        shop,
        totalUdhar,
        totalPaid,
        remaining: totalUdhar - totalPaid,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== ADD SHOP ===== */
export const createShop = async (req, res) => {
  const shop = await Shop.create({
    ...req.body,
    user: req.user._id,
  });
  res.json(shop);
};

/* ===== ADD CREDIT ===== */
export const addCredit = async (req, res) => {
  const credit = await Credit.create({
    ...req.body,
    user: req.user._id,
  });
  res.json(credit);
};

/* ===== ADD PAYMENT ===== */
export const addPayment = async (req, res) => {
  const payment = await Payment.create({
    ...req.body,
    user: req.user._id,
  });
  res.json(payment);
};
