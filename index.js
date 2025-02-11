import Replicate from 'replicate';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { readFile, writeFile, readdir, copyFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const model = "pipi32167/joy-caption:86674ddd559dbdde6ed40e0bdfc0720c84d82971e288149fcf2c35c538272617";
const watchDir = './images';
const captionsDir = './captions';

// Get output directory name from command line argument
const outputDir = process.argv[2];
if (!outputDir) {
  console.error('Please provide an output directory name.');
  console.error('Usage: npm start <output-dir-name>');
  process.exit(1);
}

// Create required directories
[watchDir, captionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Create output directory
const outputPath = `./${outputDir}`;

async function createOutputDirs() {
  if (fs.existsSync(outputPath)) {
    console.error(`Error: Directory '${outputDir}' already exists.`);
    process.exit(1);
  }
  
  await mkdir(outputPath);
  console.log(`Created output directory: ${outputDir}`);
}

// Function to check if file is an image
const isImage = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
};

// Function to save caption to individual text file and copy image
async function saveCaptionAndImage(imageName, caption) {
  const baseFileName = path.basename(imageName);
  const baseName = path.basename(imageName, path.extname(imageName));
  const captionFileName = `${baseName}.txt`;
  
  // Copy image to output directory
  await copyFile(
    path.join(watchDir, baseFileName),
    path.join(outputPath, baseFileName)
  );
  
  // Save caption to output directory
  await writeFile(
    path.join(outputPath, captionFileName),
    caption
  );
  
  console.log(`Processed: ${baseFileName}`);
}

// Function to process a single image
async function processImage(imagePath) {
  try {
    console.log(`\nProcessing image: ${path.basename(imagePath)}`);
    
    // Convert image to JPEG and get as base64 data URI
    const imageBuffer = await sharp(imagePath)
      .jpeg()
      .toBuffer();
    
    const data = imageBuffer.toString('base64');
    const image = `data:image/jpeg;base64,${data}`;
    
    const output = await replicate.run(model, {
      input: {
        prompt: "A descriptive caption for this image:",
        image: image
      }
    });

    await saveCaptionAndImage(imagePath, output);
    return output;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
  }
}

// Process all images in directory
async function processAllImages() {
  // Create output directories first
  await createOutputDirs();
  
  const files = await readdir(watchDir);
  const imageFiles = files.filter(file => isImage(file));
  
  if (imageFiles.length === 0) {
    console.log(`No images found in ${watchDir}. Please add some images and try again.`);
    process.exit(1);
  }
  
  console.log(`Found ${imageFiles.length} images to process`);
  console.log('Processing...\n');
  
  for (const file of imageFiles) {
    const imagePath = path.join(watchDir, file);
    await processImage(imagePath);
  }
  
  console.log('\nAll done! Check the output in:');
  console.log(`- ${outputPath}`);
  process.exit(0);
}

// Start processing
processAllImages();
