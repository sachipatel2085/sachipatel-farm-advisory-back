import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

/* Create Farm */
export const createFarm = async (req, res) => {
  try {
    const { farmName, totalArea, location } = req.body;

    const farm = await Farm.create({
      user: req.user._id,
      farmName,
      totalArea,
      location,
    });

    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get logged-in user's farms */
export const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user._id });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get single farm */
export const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // ownership check
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(farm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Update farm */
export const updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    // Ensure ownership
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    farm.farmName = req.body.farmName || farm.farmName;
    farm.totalArea = req.body.totalArea || farm.totalArea;
    farm.location = req.body.location || farm.location;

    const updatedFarm = await farm.save();
    res.json(updatedFarm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Delete farm */
export const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await farm.deleteOne();
    res.json({ message: "Farm removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//
export const uploadFarmPhotos = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    // ownership check
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    const uploadedPaths = req.files.map(
      (file) => `/uploads/farms/${file.filename}`,
    );

    farm.photos.push(...uploadedPaths);

    await farm.save();

    res.json({
      message: "Photos uploaded successfully",
      photos: farm.photos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===== FARM ANALYTICS ===== */
export const getFarmAnalytics = async (req, res) => {
  try {
    const farmId = req.params.id;

    const crops = await Crop.find({ farm: farmId });

    if (!crops.length) {
      return res.json({
        totalCrops: 0,
        avgHealth: 0,
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
        totalYield: 0,
      });
    }

    let totalProgress = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalYield = 0;

    crops.forEach((crop) => {
      const age =
        (Date.now() - new Date(crop.sowingDate)) / (1000 * 60 * 60 * 24);

      const progress = Math.min(100, (age / crop.expectedDurationDays) * 100);

      totalProgress += progress;

      // transactions
      crop.transactions.forEach((t) => {
        if (t.type === "income") totalIncome += Number(t.amount);
        else totalExpense += Number(t.amount);
      });

      totalYield += crop.actualYield || 0;
    });

    const avgHealth = Math.round(totalProgress / crops.length);

    res.json({
      totalCrops: crops.length,
      avgHealth,
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      totalYield,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFarmHistory = async (req, res) => {
  try {
    const farmId = req.params.id;

    const crops = await Crop.find({ farm: farmId });

    const history = crops.map((crop) => {
      let income = 0;
      let expense = 0;

      crop.transactions.forEach((t) => {
        if (t.type === "income") income += Number(t.amount);
        else expense += Number(t.amount);
      });

      return {
        cropId: crop._id,
        cropName: crop.cropName,
        season: crop.season,
        sowingDate: crop.sowingDate,
        harvestDate: crop.updatedAt, // approx
        duration: crop.expectedDurationDays,

        production: crop.actualYield || 0,
        income,
        expense,
        profit: income - expense,
      };
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
