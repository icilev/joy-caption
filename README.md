# Image Captioning App

This application uses the Replicate AI model `pipi32167/joy-caption` to generate captions for images in a specified directory.

## Setup

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Replicate API token:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

## Usage

### Generate Captions

1. Create a directory for your images inside the `images` folder:
   ```bash
   mkdir -p images/my-project
   ```

2. Copy your images into this directory:
   ```bash
   cp path/to/your/images/* images/my-project/
   ```

3. Run the application with the name of your directory:
   ```bash
   npm start my-project
   ```

   Or with a custom prompt:
   ```bash
   npm start my-project "Describe this cat image"
   ```

The application will:
- Process all images from `images/my-project`
- Create a new directory called `output/my-project`
- Rename images sequentially (1.jpg, 2.jpg, etc.) while preserving their original extension
- Save both the processed images and their corresponding caption files in this directory
- Each image will have a matching .txt file with the same name (e.g., `1.jpg` → `1.txt`)

### Resize Images

You can resize your images to 1024x1024 pixels (useful for AI training):

```bash
npm run resize my-project
```

This will:
- Take images from `images/my-project`
- Create a new directory `output/my-project-1024`
- Resize each image to exactly 1024x1024 pixels
- Center and crop the images to maintain the square aspect ratio

### Training a LoRA Model

After processing and resizing your images, you can prepare them for LoRA training:

```bash
npm run train my-project-1024 "TOK"
```

Where:
- `my-project-1024` is your processed directory name (must contain 1024x1024 images)
- `"TOK"` is the trigger word to use in prompts (e.g., "chonky", "anime", "watercolor")

The script will:
1. Verify all images are 1024x1024
2. Rename files to match the required format (`a_photo_of_TOK_1.jpg`, etc.)
3. Create a zip file in the `output` directory
4. Provide instructions for training on Replicate

#### Training on Replicate

1. Go to [Replicate LoRA Trainer](https://replicate.com/ostris/flux-dev-lora-trainer/train)
2. Upload the zip file from your `output` directory
3. Configure the training:
   - Trigger word: Same as used in the prepare command
   - Steps: 2070 (recommended)
   - LoRA rank: 16
   - Resolution: 1024
   - Batch size: 2
   - Learning rate: 0.0005
   - Optimizer: adamw8bit

#### Training Tips

- Use 12-18 images for best results
- For character LoRAs:
  - Use images with different expressions and backgrounds
  - Pair the trigger word with gender (man, woman) in prompts
  - Avoid different haircuts or ages
- For style LoRAs:
  - Select images that highlight distinctive style features
  - Use varied subjects but keep style consistent
  - Try reducing lora strength to 0.8-0.95 when generating

## Custom Prompts

You can provide a custom prompt when running the application to guide the AI model in generating captions. If no prompt is provided, it will use the default prompt: "A descriptive caption for this image"

Examples:
```bash
# Using default prompt
npm start my-project

# Using custom prompt
npm start my-project "Describe this cat image in a funny way"
npm start vacation-photos "Describe this vacation photo with focus on the location"
```

## Directory Structure

```
images/
  my-project/     # Your input directory
    photo1.jpg
    vacation.png
    screenshot.jpg
    ...
output/
  my-project/     # Captioned files
    1.jpg
    1.txt
    2.png
    2.txt
    3.jpg
    3.txt
    ...
  my-project-1024/  # Resized files (if using resize)
    1.jpg
    2.png
    3.jpg
    ...
  my-project.zip    # Training zip (if using train)
```

## Supported Image Formats

- JPG/JPEG
- WebP

## License

When using FLUX.1 models and their fine-tunes on Replicate:
- Images generated ON Replicate can be used commercially
- Images generated OFF Replicate cannot be used commercially
- LoRA models have the same license as the original FLUX.1-dev base model