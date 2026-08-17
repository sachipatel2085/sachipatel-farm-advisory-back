import CropHistory from "../models/CropHistory.js";
import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";

export const addCropHistory = async (req, res) => {
  try {
    const { cropId, title, note, type, amount, date } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const farm = await Farm.findById(crop.farm);
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const history = await CropHistory.create({
      crop: cropId,
      title,
      note,
      type,
      amount,
      date,
    });

    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCropHistory = async (req, res) => {
  try {
    const history = await CropHistory.find({
      crop: req.params.cropId,
    }).sort({ date: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCropHistory = async (req, res) => {
  try {
    const history = await CropHistory.findById(req.params.id);
    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    const crop = await Crop.findById(history.crop);
    const farm = await Farm.findById(crop.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(history, req.body);
    await history.save();

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCropHistory = async (req, res) => {
  try {
    const history = await CropHistory.findById(req.params.id);
    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    const crop = await Crop.findById(history.crop);
    const farm = await Farm.findById(crop.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await history.deleteOne();

    res.json({ message: "History deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
