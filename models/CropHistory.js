import mongoose from "mongoose";

const cropHistorySchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    note: String,

    type: {
      type: String,
      enum: ["general", "activity", "harvest", "expense", "income"],
      default: "general",
    },

    amount: Number,

    // ✅ IMPORTANT DATE FIELD
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CropHistory", cropHistorySchema);
