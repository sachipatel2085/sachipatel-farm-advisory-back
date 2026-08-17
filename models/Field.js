import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true
    },

    fieldName: {
      type: String,
      required: true,
      trim: true
    },

    area: {
      type: Number,
      required: true
    },

    soilType: {
      type: String,
      enum: ["black", "sandy", "loam"],
      required: true
    },

    irrigationType: {
      type: String,
      enum: ["drip", "canal", "rainfed"],
      required: true
    },

    waterLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Field", fieldSchema);