// utils/compressImage.js
import sharp from "sharp";
import path from "path";

export const compressImage = async (inputPath) => {
  const outputPath = inputPath.replace(
    path.extname(inputPath),
    "-compressed.jpg",
  );

  await sharp(inputPath)
    .resize({ width: 800 })
    .jpeg({ quality: 70 })
    .toFile(outputPath);
  //
  return outputPath;
};
