import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop" },

    item: String,
    amount: Number,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Credit", creditSchema);
