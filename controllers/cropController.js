import mongoose from "mongoose";
import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";
import Credit from "../models/Credit.js";
import CropHistory from "../models/CropHistory.js";
import { generateUniqueSlug, buildIdOrSlugQuery } from "../utils/slugify.js";

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
      fieldId,
      cropName,
      variety,
      season,
      sowingDate,
      expectedDurationDays,
      expectedYield,
    } = req.body;

    const farm = await Farm.findOne(buildIdOrSlugQuery(farmId));
    if (!farm) return res.status(404).json({ message: "Farm not found" });

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const slugText = variety ? `${cropName} ${variety}` : cropName;
    const slug = await generateUniqueSlug(Crop, slugText);

    const cropData = {
      farm: farm._id,
      cropName,
      slug,
      variety,
      season,
      sowingDate,
      expectedDurationDays,
      expectedYield,
    };

    if (fieldId && mongoose.Types.ObjectId.isValid(fieldId)) {
      cropData.field = fieldId;
    }

    const crop = await Crop.create(cropData);
    await pushHistory(crop._id, "Crop planted", `Sowing date: ${sowingDate}`);
    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Get Crops of a Farm ===== */
export const getCropsByFarm = async (req, res) => {
  try {
    const farm = await Farm.findOne(buildIdOrSlugQuery(req.params.farmId));

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // BUILD FILTER
    const filter = {
      farm: farm._id,
    };

    // status filter
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

/* ===== Get All User Crops ===== */
export const getAllUserCrops = async (req, res) => {
  try {
    const { status } = req.query;

    const farms = await Farm.find({ user: req.user._id }).select("_id");
    const farmIds = farms.map((f) => f._id);

    const query = {
      farm: { $in: farmIds },
    };

    if (status) {
      query.status = status;
    }

    const crops = await Crop.find(query).populate("farm", "farmName slug");

    const enriched = crops.map((crop) => {
      const age = getCropAgeDays(crop.sowingDate);
      return {
        ...crop.toObject(),
        farmName: crop.farm?.farmName || "My Farm",
        farmSlug: crop.farm?.slug || null,
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
    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(crop, req.body);
    if (!crop.slug) {
      const slugText = crop.variety ? `${crop.cropName} ${crop.variety}` : crop.cropName;
      crop.slug = await generateUniqueSlug(Crop, slugText, crop._id);
    }
    await crop.save();

    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===== Delete Crop ===== */
export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
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

/* ===== Get Crop By ID or Slug ===== */
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id)).populate(
      "farm",
      "farmName slug user",
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
      farmSlug: crop.farm.slug,
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

    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const amount = Number(quantity) * Number(price);

    // add harvest batch
    crop.harvests.push({
      quantity,
      price,
      amount,
      note,
    });

    // update total yield
    crop.actualYield = (crop.actualYield || 0) + Number(quantity);

    // auto income transaction
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

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Transaction title is required" });
    }

    if (!type || !["expense", "income"].includes(type)) {
      return res.status(400).json({ message: "Valid transaction type (income or expense) is required" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const validShopId =
      shop && typeof shop === "string" && shop.trim() !== "" && mongoose.Types.ObjectId.isValid(shop)
        ? new mongoose.Types.ObjectId(shop)
        : null;

    const txnDate = date && !isNaN(new Date(date).getTime()) ? new Date(date) : new Date();

    let credit = null;

    if (type === "expense" && validShopId) {
      credit = await Credit.create({
        user: req.user._id,
        shop: validShopId,
        crop: crop._id,
        amount: numAmount,
        item: title.trim(),
        date: txnDate,
      });
    }

    crop.transactions.push({
      title: title.trim(),
      quantity: Number(quantity) || 0,
      price: Number(price) || 0,
      amount: numAmount,
      type,
      category: category || (type === "income" ? "cropSale" : "other"),
      note: note ? String(note).trim() : "",
      date: txnDate,
      shop: validShopId,
      creditId: credit?._id || null,
    });

    if (type === "income" && quantity) {
      crop.actualYield = (crop.actualYield || 0) + Number(quantity || 0);
    }

    await crop.save();

    if (credit) {
      const txn = crop.transactions[crop.transactions.length - 1];
      credit.transactionId = txn._id;
      await credit.save();
    }

    res.status(201).json(crop.transactions);
  } catch (err) {
    console.error("addTransaction error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Edit transaction
export const updateTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const txn = crop.transactions.id(txnId);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const oldShop = txn.shop?.toString();
    const newShop =
      req.body.shop && typeof req.body.shop === "string" && req.body.shop.trim() !== "" && mongoose.Types.ObjectId.isValid(req.body.shop)
        ? new mongoose.Types.ObjectId(req.body.shop)
        : null;

    const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : txn.amount;
    const newTitle = req.body.title ? req.body.title.trim() : txn.title;
    const newDate = req.body.date && !isNaN(new Date(req.body.date).getTime()) ? new Date(req.body.date) : txn.date;

    if (txn.creditId) {
      const credit = await Credit.findById(txn.creditId);

      if (!newShop) {
        if (credit) await Credit.findByIdAndDelete(txn.creditId);
        txn.creditId = null;
        txn.shop = null;
      } else if (oldShop !== newShop.toString()) {
        if (credit) {
          credit.shop = newShop;
          credit.amount = newAmount;
          credit.item = newTitle;
          await credit.save();
        }
        txn.shop = newShop;
      } else {
        if (credit) {
          credit.amount = newAmount;
          credit.item = newTitle;
          await credit.save();
        }
      }
    } else if (newShop && txn.type === "expense") {
      const credit = await Credit.create({
        user: req.user._id,
        shop: newShop,
        crop: crop._id,
        amount: newAmount,
        item: newTitle,
        transactionId: txn._id,
      });

      txn.creditId = credit._id;
      txn.shop = newShop;
    }

    if (txn.type === "income" && req.body.quantity !== undefined) {
      const oldQty = Number(txn.quantity || 0);
      const newQty = Number(req.body.quantity || 0);
      crop.actualYield = Math.max(0, (crop.actualYield || 0) - oldQty + newQty);
      txn.quantity = newQty;
    }

    if (req.body.title) txn.title = newTitle;
    if (req.body.amount !== undefined) txn.amount = newAmount;
    if (req.body.price !== undefined) txn.price = Number(req.body.price || 0);
    if (req.body.category) txn.category = req.body.category;
    if (req.body.note !== undefined) txn.note = req.body.note;
    txn.date = newDate;
    txn.shop = newShop;

    await crop.save();

    res.json(txn);
  } catch (err) {
    console.error("updateTransaction error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { txnId } = req.params;

    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    if (farm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const txn = crop.transactions.id(txnId);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    if (txn.creditId) {
      await Credit.findByIdAndDelete(txn.creditId);
    }

    if (txn.type === "income") {
      crop.actualYield = Math.max(0, (crop.actualYield || 0) - Number(txn.quantity || 0));
    }

    crop.transactions.pull(txnId);

    await crop.save();

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("deleteTransaction error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const markCropFailed = async (req, res) => {
  try {
    const crop = await Crop.findOne(buildIdOrSlugQuery(req.params.id));

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
