import MandiService from "../services/mandiService.js";
import Crop from "../models/Crop.js";
import Farm from "../models/Farm.js";
import {
  getMarketRatesQuerySchema,
  getTrendsQuerySchema,
  getCompareQuerySchema,
  createMarketRateSchema,
} from "../validators/mandiValidator.js";

/**
 * Get paginated and filtered market rates
 * GET /api/mandi
 */
export const getMarketRates = async (req, res, next) => {
  try {
    const validatedParams = getMarketRatesQuerySchema.parse(req.query);
    const result = await MandiService.getMarketRates(validatedParams);

    return res.status(200).json({
      success: true,
      message: "Market rates retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Get price trend data for charts
 * GET /api/mandi/trends
 */
export const getPriceTrends = async (req, res, next) => {
  try {
    const validatedParams = getTrendsQuerySchema.parse(req.query);
    const result = await MandiService.getPriceTrends(validatedParams);

    return res.status(200).json({
      success: true,
      message: "Price trends retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid trend parameters",
        errors: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Compare market prices for a crop across mandis
 * GET /api/mandi/compare
 */
export const getMarketComparison = async (req, res, next) => {
  try {
    const validatedParams = getCompareQuerySchema.parse(req.query);
    const result = await MandiService.getMarketComparison(validatedParams);

    return res.status(200).json({
      success: true,
      message: "Market comparison retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comparison parameters",
        errors: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Get distinct filter values (states, districts, commodities)
 * GET /api/mandi/filters
 */
export const getFilters = async (req, res, next) => {
  try {
    const filters = await MandiService.getDistinctFilters();

    return res.status(200).json({
      success: true,
      message: "Filters retrieved successfully",
      data: filters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get market pulse & today's summary metrics
 * GET /api/mandi/today-summary
 */
export const getTodaySummary = async (req, res, next) => {
  try {
    let userCropNames = [];

    // If user is authenticated, find active crops to personalize summary
    if (req.user?._id) {
      const userFarms = await Farm.find({ user: req.user._id }).select("_id");
      const farmIds = userFarms.map((f) => f._id);
      const crops = await Crop.find({ farm: { $in: farmIds }, status: "active" }).select("cropName");
      userCropNames = crops.map((c) => c.cropName);
    } else if (req.query.userCrops) {
      userCropNames = req.query.userCrops.split(",").map((s) => s.trim());
    }

    const summary = await MandiService.getTodaySummary(userCropNames);

    return res.status(200).json({
      success: true,
      message: "Market summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed or force resync of initial mandi rates
 * POST /api/mandi/sync
 */
export const syncRates = async (req, res, next) => {
  try {
    const force = req.query.force === "true";
    const result = await MandiService.seedInitialData(force);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
