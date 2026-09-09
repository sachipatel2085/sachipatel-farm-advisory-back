import { z } from "zod";

export const getMarketRatesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  crop: z.string().trim().max(100).optional(),
  commodity: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  market: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["modalPrice", "minPrice", "maxPrice", "date", "market", "crop"])
    .default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const getTrendsQuerySchema = z.object({
  crop: z.string().trim().min(1, "Crop/Commodity name is required"),
  market: z.string().trim().optional(),
  days: z.coerce.number().int().min(3).max(90).default(14),
});

export const getCompareQuerySchema = z.object({
  crop: z.string().trim().min(1, "Crop/Commodity name is required"),
  state: z.string().trim().optional(),
});

export const createMarketRateSchema = z.object({
  crop: z.string().trim().min(2, "Crop name is required").max(100),
  commodity: z.string().trim().min(2, "Commodity is required").max(100),
  variety: z.string().trim().max(100).optional().default("Standard"),
  market: z.string().trim().min(2, "Market name is required").max(100),
  district: z.string().trim().min(2, "District is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  minPrice: z.coerce.number().positive("Min price must be positive"),
  maxPrice: z.coerce.number().positive("Max price must be positive"),
  modalPrice: z.coerce.number().positive("Modal price must be positive"),
  unit: z.string().trim().default("₹/Quintal"),
  priceChange: z.coerce.number().optional().default(0),
  date: z.coerce.date().optional().default(() => new Date()),
  source: z.string().trim().default("APMC Mandi Portal"),
}).refine((data) => data.maxPrice >= data.minPrice, {
  message: "Max price cannot be less than min price",
  path: ["maxPrice"],
});
