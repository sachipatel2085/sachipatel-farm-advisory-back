import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop"
    },

    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field"
    },

    type: {
      type: String,
      enum: ["spray", "irrigation", "harvest", "custom"],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    scheduledFor: {
      type: Date,
      required: true
    },

    sent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);