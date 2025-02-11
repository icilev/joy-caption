import Replicate from 'replicate';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { readFile, writeFile, readdir, copyFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import ora from 'ora';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const model = "pipi32167/joy-caption:86674ddd559dbdde6ed40e0bdfc0720c84d82971e288149fcf2c35c538272617";
const baseWatchDir = './images';
const baseOutputDir = './output';
const defaultPrompt = "A descriptive caption for this image";

// Get input directory name and optional custom prompt from command line arguments
const inputDir = process.argv[2];
const customPrompt = process.argv[3];

if (!inputDir) {
  console.error('Please provide an input directory name.');
  console.error('Usage: npm start <directory-name> [custom-prompt]');
  console.error('Example: npm start my-project "Describe this cat image"');
  console.error('The directory should exist in the images folder.');
  process.exit(1);
}

// Set up input and output paths
const watchDir = path.join(baseWatchDir, inputDir);
const outputPath = path.join(baseOutputDir, inputDir);

// Check if input directory exists
if (!fs.existsSync(watchDir)) {
  console.error(`Error: Directory '${watchDir}' does not exist.`);
  console.error('Please create the directory in the images folder first.');
  process.exit(1);
}

// Create required directories
if (!fs.existsSync(baseWatchDir)) {
  fs.mkdirSync(baseWatchDir);
}

// Create output directory
async function createOutputDir() {
  // Create base output directory if it doesn't exist
  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir);
  }

  if (fs.existsSync(outputPath)) {
    console.error(`Error: Output directory '${outputPath}' already exists.`);
    process.exit(1);
  }
  
  const spinner = ora('Creating output directory...').start();
  try {
    await mkdir(outputPath);
    spinner.succeed(`Created output directory: ${outputPath}`);
  } catch (error) {
    spinner.fail('Failed to create output directory');
    throw error;
  }
}

// Function to check if file is an image
const isImage = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
};

// Function to save caption to individual text file and copy image
async function saveCaptionAndImage(imageName, caption, newIndex) {
  const originalExt = path.extname(imageName);
  const newFileName = `${newIndex}${originalExt}`;
  const captionFileName = `${newIndex}.txt`;
  
  const spinner = ora(`Saving image ${newIndex}...`).start();
  
  try {
    // Copy image to output directory with new name
    await copyFile(
      imageName,
      path.join(outputPath, newFileName)
    );
    
    // Save caption to output directory
    await writeFile(
      path.join(outputPath, captionFileName),
      caption
    );
    
    spinner.succeed(`Processed: ${newFileName}`);
  } catch (error) {
    spinner.fail(`Failed to process: ${newFileName}`);
    throw error;
  }
}

// Function to process a single image
async function processImage(imagePath, index) {
  const filename = path.basename(imagePath);
  const spinner = ora(`Generating caption for image ${index}...`).start();
  
  try {
    // Convert image to JPEG and get as base64 data URI
    const imageBuffer = await sharp(imagePath)
      .jpeg()
      .toBuffer();
    
    const data = imageBuffer.toString('base64');
    const image = `data:image/jpeg;base64,${data}`;
    
    const output = await replicate.run(model, {
      input: {
        prompt: customPrompt || defaultPrompt,
        image: image
      }
    });

    spinner.succeed(`Generated caption for image ${index}`);
    await saveCaptionAndImage(imagePath, output, index);
    return output;
  } catch (error) {
    spinner.fail(`Error processing image ${index}`);
    console.error(error);
  }
}

// Function to process all images
async function processAllImages() {
  try {
    await createOutputDir();
    
    const spinner = ora('Reading directory...').start();
    const files = await readdir(watchDir);
    const imageFiles = files.filter(isImage);
    
    if (imageFiles.length === 0) {
      spinner.fail('No image files found in the directory.');
      process.exit(1);
    }
    
    spinner.succeed(`Found ${imageFiles.length} images to process`);
    
    console.log('\n🖼️  Starting image processing...');
    if (customPrompt) {
      console.log(`📝 Using custom prompt: "${customPrompt}"`);
    } else {
      console.log(`📝 Using default prompt: "${defaultPrompt}"`);
    }
    console.log();
    
    // Sort files to ensure consistent ordering
    imageFiles.sort();
    
    // Process each image with its new index
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const imagePath = path.join(watchDir, file);
      await processImage(imagePath, i + 1);
    }
    
    console.log('\n✨ All done! Check the output in:');
    console.log(`📁 ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error processing images:', error);
    process.exit(1);
  }
}

// Start processing
console.log('🚀 Starting Joy Caption...\n');
processAllImages();
