import Farm from "../models/Farm.js";

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
