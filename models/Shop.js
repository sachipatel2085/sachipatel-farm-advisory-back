import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    // 🔐 Owner (farmer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏪 Shop Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // 🧾 Optional: opening balance (existing udhar)
    openingBalance: {
      type: Number,
      default: 0,
    },

    // 📌 Optional tags (fertilizer, pesticide, seeds)
    category: {
      type: String,
      enum: ["fertilizer", "pesticide", "seeds", "general"],
      default: "general",
    },

    // 🔔 Optional credit limit
    creditLimit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Shop", shopSchema);
