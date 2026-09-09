import mongoose from "mongoose";

const marketRateSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    commodity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: "Standard",
    },
    market: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    modalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    priceChange: {
      type: Number,
      default: 0, // difference compared to previous day (₹)
    },
    unit: {
      type: String,
      default: "₹/Quintal",
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      default: "APMC Mandi Portal",
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for high-frequency queries
marketRateSchema.index({ commodity: 1, state: 1, district: 1, date: -1 });
marketRateSchema.index({ market: 1, commodity: 1, date: -1 });
marketRateSchema.index({ crop: "text", market: "text", district: "text", state: "text" });

export default mongoose.model("MarketRate", marketRateSchema);
