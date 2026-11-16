import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
    },

    totalArea: {
      type: Number,
      required: true,
      min: 0.01,
    },

    soilType: {
      type: String,
      trim: true,
      default: "",
    },

    irrigationType: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      village: String,
      district: String,
      state: String,
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Farm", farmSchema);
