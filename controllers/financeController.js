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
    const userId = req.user._id;

    // 1️⃣ Get all shops
    const shops = await Shop.find({ user: userId });

    // 2️⃣ Aggregate credits (group by shop)
    const creditAgg = await Credit.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$shop",
          totalCredit: { $sum: "$amount" },
        },
      },
    ]);

    // 3️⃣ Aggregate payments
    const paymentAgg = await Payment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$shop",
          totalPayment: { $sum: "$amount" },
        },
      },
    ]);

    // 4️⃣ Convert to map for fast lookup
    const creditMap = {};
    creditAgg.forEach((c) => {
      creditMap[c._id.toString()] = c.totalCredit;
    });

    const paymentMap = {};
    paymentAgg.forEach((p) => {
      paymentMap[p._id.toString()] = p.totalPayment;
    });

    // 5️⃣ Build final response
    const result = shops.map((shop) => {
      const credit = creditMap[shop._id] || 0;
      const paid = paymentMap[shop._id] || 0;

      const totalUdhar = (shop.openingBalance || 0) + credit;
      const remaining = totalUdhar - paid;

      return {
        shop,
        totalUdhar,
        totalPaid: paid,
        remaining,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("SHOP SUMMARY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===== ADD SHOP ===== */
export const createShop = async (req, res) => {
  try {
    const { name, phone, address, openingBalance } = req.body;

    const shop = await Shop.create({
      user: req.user._id,
      name,
      phone,
      address,
      openingBalance,
    });

    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ===== ADD CREDIT ===== */
export const addCredit = async (req, res) => {
  const credit = await Credit.create({
    ...req.body,
    user: req.user._id,
  });
  res.json(credit);
};
export const getShopLedger = async (req, res) => {
  try {
    const shopId = req.params.id;
    const userId = req.user._id;

    const shop = await Shop.findOne({ _id: shopId, user: userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const credits = await Credit.find({ shop: shopId });
    const payments = await Payment.find({ shop: shopId });

    let ledger = [];

    credits.forEach((c) => {
      ledger.push({
        _id: c._id,
        type: "debit",
        model: "credit",
        amount: c.amount,
        date: c.date,
        note: c.item || "Purchase",
      });
    });

    payments.forEach((p) => {
      ledger.push({
        _id: p._id,
        type: "credit",
        model: "payment",
        amount: p.amount,
        date: p.date,
        note: "Payment",
      });
    });
    // sort
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 🔥 running balance
    let balance = shop.openingBalance || 0;
    let totalCredit = 0;
    let totalDebit = 0;

    ledger = ledger.map((l) => {
      if (l.type === "debit") {
        balance += l.amount;
        totalDebit += l.amount;
      } else {
        balance -= l.amount;
        totalCredit += l.amount;
      }

      return {
        ...l,
        balance,
      };
    });

    const totalUdhar = (shop.openingBalance || 0) + totalDebit;
    const remaining = totalCredit - totalUdhar;

    res.json({
      shop,
      summary: {
        totalUdhar,
        totalPaid: totalCredit,
        remaining,
      },
      ledger,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteCredit = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);

    if (credit?.transactionId) {
      const crop = await Crop.findById(credit.crop);

      crop.transactions = crop.transactions.filter(
        (t) => t._id.toString() !== credit.transactionId.toString(),
      );

      await crop.save();
    }

    await Credit.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deletePayment = async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const updateCredit = async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);
    if (!credit) return res.status(404).json({ message: "Not found" });

    credit.amount = Number(req.body.amount);
    await credit.save();

    // 🔥 UPDATE CROP TRANSACTION
    if (credit.transactionId) {
      const crop = await Crop.findById(credit.crop);

      const txn = crop.transactions.id(credit.transactionId);
      if (txn) {
        txn.amount = credit.amount;
        await crop.save();
      }
    }

    res.json(credit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updatePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.amount = Number(amount);
    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ===== ADD PAYMENT ===== */
export const addPayment = async (req, res) => {
  const payment = await Payment.create({
    ...req.body,
    user: req.user._id,
  });
  res.json(payment);
};

export const getAllTransactions = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user._id }).select("_id");
    const farmIds = farms.map((f) => f._id);

    const crops = await Crop.find({ farm: { $in: farmIds } });

    let transactions = [];

    crops.forEach((crop) => {
      crop.transactions.forEach((t) => {
        transactions.push({
          ...t._doc,
          cropName: crop.cropName,
        });
      });
    });

    // 🔥 Sort latest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
