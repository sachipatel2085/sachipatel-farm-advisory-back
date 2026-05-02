export const formatDisease = (disease) => {
  if (!disease) return "Unknown Disease";

  return disease.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
