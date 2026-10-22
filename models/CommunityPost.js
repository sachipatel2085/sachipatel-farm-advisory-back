import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "pest_disease",
        "fertilizer_soil",
        "irrigation",
        "market_prices",
        "machinery_tools",
        "seeds_varieties",
        "government_schemes",
        "general",
      ],
      default: "general",
      index: true,
    },
    cropTag: {
      type: String,
      trim: true,
      default: "General",
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    isSolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    solvedByComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CommunityPost", communityPostSchema);
