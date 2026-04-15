import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: String,
    address: String,
  },
  { timestamps: true },
);

export default mongoose.model("Shop", shopSchema);
