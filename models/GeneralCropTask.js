import mongoose from "mongoose";

const generalCropTaskSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dayOffset: {
      type: Number,
      required: true,
      default: 0,
    },
    activityType: {
      type: String,
      enum: [
        "fertilizer",
        "spray",
        "irrigation",
        "weeding",
        "harvest",
        "scouting",
        "soil_test",
        "general",
      ],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    growthStage: {
      type: String,
      default: "Seedling",
    },
    dosage: {
      type: String,
      default: "",
    },
    stageWarning: {
      type: String,
      default: "",
    },
    targetPests: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GeneralCropTask", generalCropTaskSchema);
