import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";

/* ===== Helpers ===== */

const getCropAgeDays = (sowingDate) => {
  const today = new Date();
  return Math.floor((today - new Date(sowingDate)) / (1000 * 60 * 60 * 24));
};

const getGrowthStage = (age, duration) => {
  const percent = (age / duration) * 100;

  if (percent < 25) return "early";
  if (percent < 55) return "vegetative";
  if (percent < 80) return "flowering";
  return "harvest";
};

const pushHistory = async (cropId, title, note = "") => {
  await Crop.findByIdAndUpdate(cropId, {
    $push: { history: { title, note } },
  });
};

/* ===== Create Crop ===== */
export const createCrop = async (req, res) => {
  try {
    const {
      farmId,
      cropName,
      variety,
      season,
      sowingDate,
      expectedDurationDays,
      expectedYield,
    } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) return res.status(404).json({ message: "Farm not found" });

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const crop = await Crop.create({
      farm: farmId,
      cropName,
      variety,
      season,
      sowingDate,
      expectedDurationDays,
      expectedYield,
    });
    await pushHistory(crop._id, "Crop planted", `Sowing date: ${sowingDate}`);
    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Get Crops of a Farm ===== */
export const getCropsByFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);

    if (!farm) return res.status(404).json({ message: "Farm not found" });
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const crops = await Crop.find({ farm: req.params.farmId }).sort({
      createdAt: -1,
    });

    const enriched = crops.map((crop) => {
      const age = getCropAgeDays(crop.sowingDate);
      return {
        ...crop.toObject(),
        cropAgeDays: age,
        growthStage: getGrowthStage(age, crop.expectedDurationDays),
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Get All Crops of User ===== */
export const getAllUserCrops = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user._id }).select("_id");

    const farmIds = farms.map((f) => f._id);

    const crops = await Crop.find({ farm: { $in: farmIds } }).populate(
      "farm",
      "farmName",
    );

    const enriched = crops.map((crop) => {
      const age = getCropAgeDays(crop.sowingDate);
      return {
        ...crop.toObject(),
        farmName: crop.farm.farmName,
        cropAgeDays: age,
        growthStage: getGrowthStage(age, crop.expectedDurationDays),
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Update Crop ===== */
export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(crop, req.body);
    await crop.save();

    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Delete Crop ===== */
export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await crop.deleteOne();
    res.json({ message: "Crop deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate(
      "farm",
      "farmName user",
    );

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    // ownership check
    if (crop.farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const age = Math.floor(
      (Date.now() - new Date(crop.sowingDate)) / (1000 * 60 * 60 * 24),
    );

    const progress = (age / crop.expectedDurationDays) * 100;

    let stage = "early";
    if (progress >= 80) stage = "harvest";
    else if (progress >= 55) stage = "flowering";
    else if (progress >= 25) stage = "vegetative";

    res.json({
      ...crop.toObject(),
      farmName: crop.farm.farmName,
      cropAgeDays: age,
      growthStage: stage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addHarvestBatch = async (req, res) => {
  try {
    const { quantity, price, note } = req.body;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const amount = Number(quantity) * Number(price);

    // ✅ add harvest batch
    crop.harvests.push({
      quantity,
      price,
      amount,
      note,
    });

    // ✅ update total yield
    crop.actualYield = (crop.actualYield || 0) + Number(quantity);

    // ✅ auto income transaction
    crop.transactions.push({
      title: "Harvest Sale",
      quantity,
      price,
      amount,
      type: "income",
      category: "harvest",
    });

    await crop.save();

    await pushHistory(
      crop._id,
      "Harvest batch 🌾",
      `Collected ${quantity} kg, sold at ₹${price}/kg → ₹${amount}`,
    );

    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addTransaction = async (req, res) => {
  try {
    const { title, quantity, price, amount, type, category, note, date } =
      req.body;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    crop.transactions.push({
      title,
      quantity,
      price,
      amount,
      type,
      category,
      note,
      date,
    });

    // ✅ AUTO UPDATE ACTUAL YIELD
    if (type === "income") {
      crop.actualYield = (crop.actualYield || 0) + Number(quantity || 0);
    }

    await crop.save();

    res.json(crop.transactions);
  } catch (err) {
    console.error("ADD TXN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Edit transaction
export const updateTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const txn = crop.transactions.find((t) => t._id.toString() === txnId);

    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const { title, quantity, price, amount, category, note, date } = req.body;

    const oldQty = txn.quantity || 0;
    const newQty = Number(quantity || 0);

    txn.title = title;
    txn.quantity = quantity;
    txn.price = price;
    txn.amount = amount;
    txn.category = category;
    txn.note = note;
    txn.date = date;

    if (txn.type === "income") {
      crop.actualYield = (crop.actualYield || 0) - oldQty + newQty;
    }

    await crop.save();

    res.json(txn);
  } catch (err) {
    console.error("UPDATE TXN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🗑 Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const txn = crop.transactions.find((t) => t._id.toString() === txnId);

    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    // ✅ ADJUST ACTUAL YIELD IF INCOME
    if (txn.type === "income") {
      crop.actualYield = (crop.actualYield || 0) - Number(txn.quantity || 0);
    }

    crop.transactions = crop.transactions.filter(
      (t) => t._id.toString() !== txnId,
    );

    await crop.save();

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
