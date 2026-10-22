import mongoose from "mongoose";

const cropDecisionRuleSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    season: {
      type: String,
      enum: ["kharif", "rabi", "summer"],
      required: true,
      index: true,
    },

    suitableSoil: {
      type: [String], // ["black", "loam", "alluvial", "red", "sandy"]
      default: ["loam"],
    },

    waterRequirement: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    avgYieldPerAcre: {
      type: Number, // in quintals (qtl) or kg
      required: true,
    },

    yieldUnit: {
      type: String,
      default: "quintal",
    },

    avgMarketPrice: {
      type: Number, // ₹ per quintal or unit
      required: true,
    },

    avgCostPerAcre: {
      type: Number, // total estimated cultivation cost in ₹
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    botanicalFamily: {
      type: String,
      default: "General",
    },

    durationDays: {
      type: Number,
      default: 120,
    },

    sowingWindow: {
      type: String,
      default: "", // e.g. "15 Oct - 15 Nov"
    },

    harvestWindow: {
      type: String,
      default: "", // e.g. "15 Mar - 15 Apr"
    },

    benefits: {
      type: [String],
      default: [],
    },

    drawbacks: {
      type: [String],
      default: [],
    },

    idealSuccessors: {
      type: [String],
      default: [],
    },

    incompatibleSuccessors: {
      type: [String],
      default: [],
    },

    costBreakdown: {
      seedCost: { type: Number, default: 2000 },
      fertilizerCost: { type: Number, default: 3500 },
      pesticideCost: { type: Number, default: 2500 },
      machineryCost: { type: Number, default: 3000 },
      labourCost: { type: Number, default: 4000 },
      irrigationCost: { type: Number, default: 1500 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("CropDecisionRule", cropDecisionRuleSchema);
