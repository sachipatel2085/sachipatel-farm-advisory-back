// utils/mapDisease.js
export const mapDisease = (labels) => {
  if (labels.includes("aphid")) return "Aphid Attack";
  if (labels.includes("curl") || labels.includes("leaf"))
    return "Leaf Curl Disease";
  if (labels.includes("yellow")) return "Nutrient Deficiency";

  return "Unknown Issue";
};
export const formatDisease = (disease) => {
  if (!disease) return "Unknown Disease";

  return disease.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
