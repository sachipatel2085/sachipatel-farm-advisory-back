import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },

    amount: Number,
    method: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
