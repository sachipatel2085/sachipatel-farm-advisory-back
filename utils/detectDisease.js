// utils/detectDisease.js
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

export const detectDisease = async (imagePath) => {
  const [result] = await client.labelDetection(imagePath);
  return result.labelAnnotations.map((l) => l.description.toLowerCase());
};
//
