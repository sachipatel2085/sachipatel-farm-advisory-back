import mongoose from "mongoose";

const advisoryRuleSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true
    },

    minDay: {
      type: Number,
      required: true
    },

    maxDay: {
      type: Number,
      required: true
    },

    soilType: {
      type: String
    },

    conditions: {
      recentSpray: Boolean,
      recentFertilizer: Boolean,
      highMoisture: Boolean
    },

    message: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: "green"
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("AdvisoryRule", advisoryRuleSchema);
