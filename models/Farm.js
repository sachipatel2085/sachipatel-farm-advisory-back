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
    },

    totalArea: {
      type: Number,
      required: true,
    },

    location: {
      village: String,
      district: String,
      state: String,
      latitude: Number,
      longitude: Number,
    },
    photos: [
      {
        type: String, // file path or url
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Farm", farmSchema);
