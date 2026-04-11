import mongoose from "mongoose";

const profitSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true
    },

    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: true
    },

    totalExpense: {
      type: Number,
      required: true
    },

    totalIncome: {
      type: Number,
      required: true
    },

    profit: {
      type: Number,
      required: true
    },

    sellingPricePerUnit: {
      type: Number,
      required: true
    },

    successLevel: {
      type: String,
      enum: ["good", "average", "poor"],
      required: true
    },

    seasonYear: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Profit", profitSchema);