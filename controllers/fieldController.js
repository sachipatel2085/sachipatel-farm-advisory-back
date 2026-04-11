import Field from "../models/Field.js";
import Farm from "../models/Farm.js";

/* Create Field under a farm */
export const createField = async (req, res) => {
  try {
    const { farmId, fieldName, area, soilType, irrigationType, waterLevel } =
      req.body;

    const farm = await Farm.findById(farmId);

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    // Ensure user owns farm
    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const field = await Field.create({
      farm: farmId,
      fieldName,
      area,
      soilType,
      irrigationType,
      waterLevel
    });

    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get fields of a farm */
export const getFieldsByFarm = async (req, res) => {
  try {
    const fields = await Field.find({ farm: req.params.farmId });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Update field */
export const updateField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);

    if (!field) return res.status(404).json({ message: "Field not found" });

    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(field, req.body);

    const updatedField = await field.save();
    res.json(updatedField);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Delete field */
export const deleteField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);

    if (!field) return res.status(404).json({ message: "Field not found" });

    const farm = await Farm.findById(field.farm);

    if (farm.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await field.deleteOne();
    res.json({ message: "Field deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};