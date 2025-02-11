import * as fs from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get input directory name and trigger word from command line arguments
const inputDir = process.argv[2];
const triggerWord = process.argv[3];

if (!inputDir || !triggerWord) {
  console.error('Please provide all required arguments.');
  console.error('Usage: npm run train <directory-name> <trigger-word>');
  console.error('Example: npm run train my-project "TOK"');
  console.error('The directory should exist in the output folder.');
  process.exit(1);
}

// Set up paths
const sourceDir = inputDir.endsWith('-1024') ? inputDir : `${inputDir}-1024`;
const sourcePath = path.join(__dirname, 'output', sourceDir);
const zipPath = path.join(__dirname, 'output', `${inputDir}.zip`);

// Check if source directory exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Directory '${sourcePath}' does not exist.`);
  console.error('Please resize your images first:');
  console.error(`npm run resize ${inputDir}`);
  process.exit(1);
}

// Function to verify image dimensions
async function verifyImageDimensions(directory) {
  const spinner = ora('Verifying image dimensions...').start();
  const files = await readdir(directory);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

  for (const file of imageFiles) {
    const imagePath = path.join(directory, file);
    const metadata = await sharp(imagePath).metadata();
    
    if (metadata.width !== 1024 || metadata.height !== 1024) {
      spinner.fail(`Error: Image ${file} is not 1024x1024 (found ${metadata.width}x${metadata.height})`);
      console.error('\nPlease resize your images first:');
      console.error(`npm run resize ${inputDir}`);
      process.exit(1);
    }
  }

  spinner.succeed(`Verified ${imageFiles.length} images are all 1024x1024`);
  return imageFiles.length;
}

// Function to rename files with trigger word
async function renameFiles(directory, triggerWord) {
  const spinner = ora('Preparing training files...').start();
  const tempDir = path.join(__dirname, 'output', `${inputDir}-temp`);
  
  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const files = await readdir(directory);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const oldPath = path.join(directory, file);
    const extension = path.extname(file);
    const newName = `a_photo_of_${triggerWord}_${i + 1}${extension}`;
    const newPath = path.join(tempDir, newName);
    
    // Copy file with new name
    fs.copyFileSync(oldPath, newPath);
  }

  spinner.succeed(`Prepared ${imageFiles.length} files for training`);
  return tempDir;
}

// Function to create zip file
async function createZipFile(directory) {
  const spinner = ora('Creating zip file...').start();
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      spinner.succeed(`Created zip file: ${zipPath} (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', (err) => {
      spinner.fail('Failed to create zip file');
      reject(err);
    });

    archive.pipe(output);
    archive.directory(directory, false);
    archive.finalize();
  });
}

// Function to clean up temp directory
function cleanupTemp(tempDir) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
}

// Main function
async function main() {
  console.log('🚀 Preparing files for LoRA training...\n');
  
  try {
    // Verify all images are 1024x1024
    const imageCount = await verifyImageDimensions(sourcePath);
    
    if (imageCount === 0) {
      console.error('❌ No images found in the source directory');
      process.exit(1);
    }

    if (imageCount < 12 || imageCount > 18) {
      console.warn('\n⚠️  Warning: Recommended dataset size is 12-18 images');
      console.warn(`   Your dataset has ${imageCount} images`);
    }

    // Rename files for training
    const tempDir = await renameFiles(sourcePath, triggerWord);

    // Create zip file
    await createZipFile(tempDir);

    // Clean up temp directory
    cleanupTemp(tempDir);

    console.log('\n✨ Files prepared successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to https://replicate.com/ostris/flux-dev-lora-trainer/train');
    console.log('2. Upload the zip file:', zipPath);
    console.log('3. Configure the training:');
    console.log(`   - Trigger word: ${triggerWord}`);
    console.log('   - Steps: 2070');
    console.log('   - LoRA rank: 16');
    console.log('   - Resolution: 1024');
    console.log('   - Batch size: 2');
    console.log('   - Learning rate: 0.0005');
    console.log('   - Optimizer: adamw8bit');
    console.log('\n💡 Tips:');
    console.log('- For character LoRAs, pair the trigger word with a gender (man, woman, etc)');
    console.log('- For style influence, try reducing lora strength to 0.8-0.95');
    console.log('- The model will be available on Replicate after training');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Start the process
main();
