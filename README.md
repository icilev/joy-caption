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

You can also resize your images to 1024x1024 pixels (useful for AI training):

```bash
npm run resize my-project
```

This will:
- Take images from `images/my-project`
- Create a new directory `output/my-project-1024`
- Resize each image to exactly 1024x1024 pixels
- Center and crop the images to maintain the square aspect ratio

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

Before processing:
```
images/
  my-project/     # Your input directory
    photo1.jpg
    vacation.png
    screenshot.jpg
    ...
```

After processing:
```
images/
  my-project/     # Original images remain here
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
```

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP