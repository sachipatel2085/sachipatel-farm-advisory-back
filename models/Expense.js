import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
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

    category: {
      type: String,
      enum: ["seed", "fertilizer", "spray", "labor", "irrigation", "other"],
      required: true
    },

    description: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);