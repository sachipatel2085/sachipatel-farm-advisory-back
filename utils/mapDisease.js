// utils/mapDisease.js
export const mapDisease = (labels) => {
  if (labels.includes("aphid")) return "Aphid Attack";
  if (labels.includes("curl") || labels.includes("leaf"))
    return "Leaf Curl Disease";
  if (labels.includes("yellow")) return "Nutrient Deficiency";

  return "Unknown Issue";
};
//
