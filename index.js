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
const baseWatchDir = './images';
const captionsDir = './captions';

// Get input directory name from command line argument
const inputDir = process.argv[2];
if (!inputDir) {
  console.error('Please provide an input directory name.');
  console.error('Usage: npm start <directory-name>');
  console.error('The directory should exist in the images folder.');
  process.exit(1);
}

// Set up input and output paths
const watchDir = path.join(baseWatchDir, inputDir);
const outputPath = `./${inputDir}`;

// Check if input directory exists
if (!fs.existsSync(watchDir)) {
  console.error(`Error: Directory '${watchDir}' does not exist.`);
  console.error('Please create the directory in the images folder first.');
  process.exit(1);
}

// Create required directories
[baseWatchDir, captionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Create output directory
async function createOutputDir() {
  if (fs.existsSync(outputPath)) {
    console.error(`Error: Output directory '${outputPath}' already exists.`);
    process.exit(1);
  }
  
  await mkdir(outputPath);
  console.log(`Created output directory: ${outputPath}`);
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

// Function to process all images
async function processAllImages() {
  try {
    await createOutputDir();
    
    const files = await readdir(watchDir);
    const imageFiles = files.filter(isImage);
    
    if (imageFiles.length === 0) {
      console.error('No image files found in the directory.');
      process.exit(1);
    }
    
    console.log(`Found ${imageFiles.length} images to process...`);
    
    for (const file of imageFiles) {
      const imagePath = path.join(watchDir, file);
      await processImage(imagePath);
    }
    
    console.log('\nAll done! Check the output in:');
    console.log(`- ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error processing images:', error);
    process.exit(1);
  }
}

// Start processing
processAllImages();
