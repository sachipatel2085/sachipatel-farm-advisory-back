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

    totalArea: {
      type: Number,
      required: true,
      min: 0.01,
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
