import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";
import Credit from "../models/Credit.js"; // 🔥 import

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

    // 🔥 BUILD FILTER
    const filter = {
      farm: req.params.farmId,
    };

    // ✅ status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 });

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
    const { status } = req.query; // 🔥 get filter from frontend

    const farms = await Farm.find({ user: req.user._id }).select("_id");
    const farmIds = farms.map((f) => f._id);

    // 🔥 build query
    let query = {
      farm: { $in: farmIds },
    };

    if (status) {
      query.status = status; // ✅ apply filter
    }

    const crops = await Crop.find(query).populate("farm", "farmName");

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
    // mark crop as harvested
    crop.status = "harvested";
    await crop.save();

    await CropHistory.create({
      crop: crop._id,
      title: "Harvest 🌾",
      note: `${quantity} kg @ ₹${price}`,
      type: "harvest",
      amount,
    });

    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addTransaction = async (req, res) => {
  try {
    const { title, quantity, price, amount, type, category, note, date, shop } =
      req.body;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    // 🔥 CREATE CREDIT IF EXPENSE + SHOP
    let credit = null;

    if (type === "expense" && shop) {
      credit = await Credit.create({
        user: req.user._id,
        shop,
        crop: crop._id,
        amount,
        item: title,
      });
    }

    // ✅ PUSH TRANSACTION
    crop.transactions.push({
      title,
      quantity,
      price,
      amount,
      type,
      category,
      note,
      date,
      shop,
      creditId: credit?._id || null,
    });

    await crop.save();

    // 🔥 LINK BACK (VERY IMPORTANT)
    if (credit) {
      const txn = crop.transactions[crop.transactions.length - 1];

      credit.transactionId = txn._id;
      await credit.save();
    }
    res.json(crop.transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ✏️ Edit transaction
export const updateTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findById(req.params.id);
    const txn = crop.transactions.id(txnId);

    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const oldShop = txn.shop?.toString();
    const newShop = req.body.shop;
    const newAmount = Number(req.body.amount);

    // 🔥 HANDLE CREDIT SYNC
    if (txn.creditId) {
      const credit = await Credit.findById(txn.creditId);

      // ❌ shop removed
      if (!newShop) {
        await Credit.findByIdAndDelete(txn.creditId);
        txn.creditId = null;
        txn.shop = null;
      }

      // 🔁 shop changed
      else if (oldShop !== newShop) {
        credit.shop = newShop;
        credit.amount = newAmount;
        await credit.save();

        txn.shop = newShop;
      }

      // ✏️ amount change
      else {
        credit.amount = newAmount;
        await credit.save();
      }
    }

    // 🔥 new shop added
    else if (newShop && txn.type === "expense") {
      const credit = await Credit.create({
        user: req.user._id,
        shop: newShop,
        crop: crop._id,
        amount: newAmount,
        item: req.body.title,
      });

      txn.creditId = credit._id;
      txn.shop = newShop;
    }

    // update txn
    Object.assign(txn, req.body);

    await crop.save();

    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 🗑 Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const txn = crop.transactions.id(txnId);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    // 🔥 delete linked credit
    if (txn.creditId) {
      await Credit.findByIdAndDelete(txn.creditId);
    }

    // 🔥 yield fix
    if (txn.type === "income") {
      crop.actualYield -= Number(txn.quantity || 0);
    }

    // ✅ FIXED DELETE
    crop.transactions.pull(txnId);

    await crop.save();

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const markCropFailed = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    crop.status = "failed";

    await crop.save();

    await CropHistory.create({
      crop: crop._id,
      title: "Crop Failed ❌",
      note: "Marked as failed",
      type: "failure",
    });

    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
