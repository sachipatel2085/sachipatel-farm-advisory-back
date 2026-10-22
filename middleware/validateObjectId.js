import mongoose from "mongoose";

/**
 * Validates that a route parameter is either a valid MongoDB ObjectId or a valid URL slug.
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const val = req.params[paramName];

    if (!val || typeof val !== "string") {
      return res.status(400).json({
        message: `Invalid ${paramName}`,
      });
    }

    const trimmed = val.trim();
    const isObjectId =
      mongoose.Types.ObjectId.isValid(trimmed) &&
      String(new mongoose.Types.ObjectId(trimmed)) === String(trimmed);

    // Allow URL slugs (alphanumerics, hyphens, underscores)
    const isValidSlug = /^[a-zA-Z0-9_\-\.]+$/.test(trimmed);

    if (!isObjectId && !isValidSlug) {
      return res.status(400).json({
        message: `Invalid ${paramName}`,
      });
    }

    next();
  };
};

export const validateIdOrSlug = validateObjectId;
