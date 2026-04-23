import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    cropName: {
      type: String,
      required: true,
      trim: true,
    },

    variety: String,

    season: {
      type: String,
      enum: ["kharif", "rabi", "summer"],
      required: true,
    },

    sowingDate: {
      type: Date,
      required: true,
    },

    expectedDurationDays: {
      type: Number,
      required: true,
    },

    expectedYield: Number,

    actualYield: {
      type: Number,
      default: 0, // total of all batches
    },

    status: {
      type: String,
      enum: ["active", "harvested", "failed"],
      default: "active",
    },
    history: [
      {
        title: String,
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],
    transactions: {
      type: [
        {
          title: String,

          quantity: Number, // ✅ for income
          price: Number, // ✅ for income

          amount: {
            type: Number,
            required: true,
          },

          type: {
            type: String,
            enum: ["expense", "income"],
            required: true,
          },

          category: String,
          date: { type: Date, default: Date.now },
          shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
          },

          // 🔥 LINK CREDIT
          creditId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Credit",
          },
        },
      ],
      default: [],
    },
    harvests: [
      {
        quantity: Number, // kg harvested in this batch
        price: Number, // ₹ per kg
        amount: Number, // total = qty * price
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Crop", cropSchema);
