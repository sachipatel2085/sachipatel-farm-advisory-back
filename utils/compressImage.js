// utils/compressImage.js
import sharp from "sharp";
import path from "path";

export const compressImage = async (inputPath) => {
  const dir = path.dirname(inputPath); // uploads/farms
  const ext = path.extname(inputPath); // .jpg
  const name = path.basename(inputPath, ext); // filename

  const outputPath = path.join(dir, `${name}-compressed.jpg`);

  await sharp(inputPath)
    .resize({ width: 800 })
    .jpeg({ quality: 70 })
    .toFile(outputPath);

  return outputPath;
};
