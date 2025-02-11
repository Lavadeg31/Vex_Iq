const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertSvgToPng(inputPath, outputPath, size) {
  try {
    const svg = await fs.readFile(inputPath);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

async function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Create icon
  await convertSvgToPng(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'icon.png'),
    1024
  );

  // Create adaptive icon
  await convertSvgToPng(
    path.join(assetsDir, 'adaptive-icon.svg'),
    path.join(assetsDir, 'adaptive-icon.png'),
    1024
  );

  // Create splash screen
  await convertSvgToPng(
    path.join(assetsDir, 'splash.svg'),
    path.join(assetsDir, 'splash.png'),
    2048
  );
}

main().catch(console.error); 