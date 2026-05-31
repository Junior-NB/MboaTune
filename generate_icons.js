const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = '/home/junior-nb/.gemini/antigravity/brain/084d12f7-f99e-4c9a-8902-2144ed58817a/mboatune_icon_flat_1780174751782.png';
const RES_DIR = path.join(__dirname, 'android/app/src/main/res');

const SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('Source image not found:', SOURCE_IMAGE);
    return;
  }

  for (const [dirName, size] of Object.entries(SIZES)) {
    const dirPath = path.join(RES_DIR, dirName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // For ic_launcher.png (Square with potential rounded corners by launcher)
    await sharp(SOURCE_IMAGE)
      .resize(size, size)
      .png()
      .toFile(path.join(dirPath, 'ic_launcher.png'));
      
    // For ic_launcher_round.png (Circle)
    const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`;
    await sharp(SOURCE_IMAGE)
      .resize(size, size)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_round.png'));
      
    console.log(`Generated ${size}x${size} icon in ${dirName}`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
