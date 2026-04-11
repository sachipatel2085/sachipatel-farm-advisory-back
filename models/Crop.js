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

    actualYield: Number,

    status: {
      type: String,
      enum: ["growing", "harvested", "failed"],
      default: "growing",
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
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Crop", cropSchema);
