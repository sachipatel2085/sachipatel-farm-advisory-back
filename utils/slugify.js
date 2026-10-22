import crypto from "crypto";
import mongoose from "mongoose";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import CommunityPost from "../models/CommunityPost.js";
import Shop from "../models/Shop.js";

/**
 * Clean text into URL-safe slug format.
 */
export function slugify(text) {
  if (!text) return "item";
  return String(text)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, "") // remove invalid characters
    .replace(/[\s_-]+/g, "-") // collapse whitespace and underscores into single hyphens
    .replace(/^-+|-+$/g, "") || "item";
}

/**
 * Generate a unique slug for a Mongoose model.
 * If base slug already exists, appends a short hex suffix.
 */
export async function generateUniqueSlug(Model, text, currentId = null) {
  const base = slugify(text);

  // Check if base slug is free
  const baseQuery = { slug: base };
  if (currentId) {
    baseQuery._id = { $ne: currentId };
  }

  const existing = await Model.findOne(baseQuery).select("_id").lean();
  if (!existing) {
    return base;
  }

  // Append a short random suffix until unique
  let candidate = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const suffix = crypto.randomBytes(2).toString("hex"); // e.g. "4b8f"
    candidate = `${base}-${suffix}`;

    const query = { slug: candidate };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const collision = await Model.findOne(query).select("_id").lean();
    if (!collision) {
      isUnique = true;
    }
  }

  return candidate || `${base}-${Date.now().toString(36)}`;
}

/**
 * Helper to build a query matching either a valid ObjectId or a slug string.
 */
export function buildIdOrSlugQuery(identifier, extra = {}) {
  const isObjectId =
    mongoose.Types.ObjectId.isValid(identifier) &&
    String(new mongoose.Types.ObjectId(identifier)) === String(identifier);

  if (isObjectId) {
    return {
      $or: [{ _id: identifier }, { slug: identifier }],
      ...extra,
    };
  }

  return {
    slug: identifier,
    ...extra,
  };
}

/**
 * Backfill missing slugs for existing records in the database.
 */
export async function backfillSlugs() {
  try {
    // 1. Farms
    const farms = await Farm.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });
    for (const f of farms) {
      f.slug = await generateUniqueSlug(Farm, f.farmName || "farm", f._id);
      await f.save();
    }
    if (farms.length > 0) {
      console.log(`[Backfill] Generated slugs for ${farms.length} farms`);
    }

    // 2. Crops
    const crops = await Crop.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });
    for (const c of crops) {
      const name = c.variety ? `${c.cropName} ${c.variety}` : c.cropName;
      c.slug = await generateUniqueSlug(Crop, name || "crop", c._id);
      await c.save();
    }
    if (crops.length > 0) {
      console.log(`[Backfill] Generated slugs for ${crops.length} crops`);
    }

    // 3. Community Posts
    const posts = await CommunityPost.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });
    for (const p of posts) {
      p.slug = await generateUniqueSlug(CommunityPost, p.title || "post", p._id);
      await p.save();
    }
    if (posts.length > 0) {
      console.log(`[Backfill] Generated slugs for ${posts.length} community posts`);
    }

    // 4. Shops
    const shops = await Shop.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });
    for (const s of shops) {
      s.slug = await generateUniqueSlug(Shop, s.name || "shop", s._id);
      await s.save();
    }
    if (shops.length > 0) {
      console.log(`[Backfill] Generated slugs for ${shops.length} shops`);
    }
  } catch (error) {
    console.warn("[Backfill Warning] Slug backfill error:", error.message);
  }
}
