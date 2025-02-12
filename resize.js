import sharp from 'sharp';
import * as fs from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get input directory name from command line argument
const inputDir = process.argv[2];

if (!inputDir) {
  console.error('Please provide an input directory name.');
  console.error('Usage: npm run resize <directory-name>');
  console.error('Example: npm run resize my-project');
  console.error('The directory should exist in the images folder.');
  process.exit(1);
}

// Set up paths
const sourcePath = path.join(__dirname, 'images', inputDir);
const outputPath = path.join(__dirname, 'output', `${inputDir}-512`);

// Check if source directory exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Directory '${sourcePath}' does not exist.`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Function to check if file is an image
const isImage = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
};

// Function to resize a single image
async function resizeImage(filename) {
  const inputPath = path.join(sourcePath, filename);
  const outputFilename = path.basename(filename);
  const outputImagePath = path.join(outputPath, outputFilename);
  
  const spinner = ora(`Resizing ${filename}...`).start();
  
  try {
    await sharp(inputPath)
      // D'abord on redimensionne pour que le plus petit côté fasse 512
      .resize(512, 512, {
        fit: 'cover',      // Couvre toute la zone en coupant l'excédent
        position: 'center' // Centre l'image avant de couper
      })
      .toFile(outputImagePath);

    spinner.succeed(`Resized ${filename} to 512x512`);
  } catch (error) {
    spinner.fail(`Failed to resize ${filename}`);
    console.error(error);
  }
}

// Main function
async function main() {
  console.log('🖼️  Starting image resizing...\n');
  
  try {
    // Get all image files
    const files = await readdir(sourcePath);
    const imageFiles = files.filter(isImage);
    
    if (imageFiles.length === 0) {
      console.error('No image files found in the directory.');
      process.exit(1);
    }
    
    console.log(`Found ${imageFiles.length} images to process\n`);
    
    // Process each image
    for (const file of imageFiles) {
      await resizeImage(file);
    }
    
    console.log('\n✨ All done! Check your resized images in:');
    console.log(`📁 ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Start the process
main();
