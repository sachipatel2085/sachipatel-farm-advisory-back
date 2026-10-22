import express from "express";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import CommunityPost from "../models/CommunityPost.js";
import Shop from "../models/Shop.js";
import { buildIdOrSlugQuery } from "../utils/slugify.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = buildIdOrSlugQuery(id);

    const farm = await Farm.findOne(query);
    if (farm) return res.json({ name: farm.farmName, slug: farm.slug, id: farm._id });

    const crop = await Crop.findOne(query);
    if (crop) return res.json({ name: crop.cropName, slug: crop.slug, id: crop._id });

    const post = await CommunityPost.findOne(query);
    if (post) return res.json({ name: post.title, slug: post.slug, id: post._id });

    const shop = await Shop.findOne(query);
    if (shop) return res.json({ name: shop.name, slug: shop.slug, id: shop._id });

    res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: "Invalid identifier" });
  }
});

export default router;
