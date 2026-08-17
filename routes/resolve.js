import express from "express";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const farm = await Farm.findById(id);
    if (farm) return res.json({ name: farm.farmName });

    const crop = await Crop.findById(id);
    if (crop) return res.json({ name: crop.cropName });

    res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: "Invalid ID" });
  }
});

export default router;
