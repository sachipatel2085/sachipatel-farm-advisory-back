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
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
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
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

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
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await farm.deleteOne();
    res.json({ message: "Farm removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFarmPhotos = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No photos uploaded",
      });
    }

    const uploadedPaths = [];

    for (const file of req.files) {
      const filename = `${crypto.randomUUID()}.webp`;

      const outputPath = path.join(uploadPath, filename);

      await sharp(file.buffer)
        .rotate()
        .resize({
          width: 3000,
          height: 3000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
        })
        .toFile(outputPath);

      uploadedPaths.push(`/uploads/farms/${filename}`);
    }

    farm.photos.push(...uploadedPaths);

    await farm.save();

    res.json({
      message: "Photos uploaded successfully",
      photos: farm.photos,
    });
  } catch (error) {
    console.error("Farm photo upload error:", error);

    res.status(400).json({
      message: "Invalid image upload",
    });
  }
};
/* ===== FARM ANALYTICS ===== */
export const getFarmAnalytics = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    const crops = await Crop.find({
      farm: farm._id,
    });

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

    // existing calculation...
  } catch (error) {
    console.error("Farm analytics error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getFarmHistory = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    const crops = await Crop.find({
      farm: farm._id,
    });

    const history = crops.map((crop) => {
      let income = 0;
      let expense = 0;

      crop.transactions.forEach((t) => {
        if (t.type === "income") {
          income += Number(t.amount);
        } else {
          expense += Number(t.amount);
        }
      });

      return {
        cropId: crop._id,
        cropName: crop.cropName,
        season: crop.season,
        sowingDate: crop.sowingDate,
        harvestDate: crop.updatedAt,
        duration: crop.expectedDurationDays,
        production: crop.actualYield || 0,
        income,
        expense,
        profit: income - expense,
      };
    });

    res.json(history);
  } catch (error) {
    console.error("Farm history error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
