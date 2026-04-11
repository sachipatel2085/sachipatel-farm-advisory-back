import mongoose from "mongoose";

const cropDecisionRuleSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true
    },

    season: {
      type: String,
      enum: ["kharif", "rabi", "summer"],
      required: true
    },

    suitableSoil: [String], // ["black", "loam"]

    waterRequirement: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    },

    avgYieldPerAcre: {
      type: Number,
      required: true
    },

    avgMarketPrice: {
      type: Number,
      required: true
    },

    avgCostPerAcre: {
      type: Number,
      required: true
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("CropDecisionRule", cropDecisionRuleSchema);
