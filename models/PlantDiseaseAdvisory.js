import mongoose from "mongoose";

const productRecommendationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    activeIngredient: {
      type: String,
      default: "",
    },
    productType: {
      type: String,
      enum: ["chemical", "organic", "bio", "nutrient", "tool"],
      default: "chemical",
    },
    dosage: {
      type: String,
      default: "",
    },
    applicationNotes: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const plantDiseaseAdvisorySchema = new mongoose.Schema(
  {
    diseaseKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // Pure disease name WITHOUT crop prefix (e.g. "Early Blight", "Late Blight", "Powdery Mildew")
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    scientificName: {
      type: String,
      default: "",
      trim: true,
    },
    // Multiple crops that this disease can infect
    crops: {
      type: [String],
      required: true,
      default: ["All Crops"],
      index: true,
    },
    // Backward-compatible primary crop string
    crop: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "fungal",
        "bacterial",
        "viral",
        "pest",
        "deficiency",
        "healthy",
        "general",
      ],
      default: "fungal",
      index: true,
    },
    severity: {
      type: String,
      enum: ["none", "low", "medium", "high", "critical"],
      default: "medium",
    },
    isHealthy: {
      type: Boolean,
      default: false,
      index: true,
    },
    stageOfOccurrence: {
      type: String,
      default: "All Stages",
    },
    symptoms: {
      type: [String],
      default: [],
    },
    cause: {
      type: String,
      required: true,
      trim: true,
    },
    chemicalTreatment: {
      type: String,
      default: "",
      trim: true,
    },
    organicSolution: {
      type: String,
      default: "",
      trim: true,
    },
    prevention: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedProducts: {
      type: [productRecommendationSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-sync crop to first element of crops if not explicitly set
plantDiseaseAdvisorySchema.pre("save", function (next) {
  if (Array.isArray(this.crops) && this.crops.length > 0 && !this.crop) {
    this.crop = this.crops[0];
  }
  next();
});

export default mongoose.model(
  "PlantDiseaseAdvisory",
  plantDiseaseAdvisorySchema
);
