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
- Create a new directory called `my-project` in the root folder
- Save both the processed images and their corresponding caption files in this directory
- Each image will have a matching .txt file with the same name (e.g., `photo.jpg` → `photo.txt`)

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
    image1.jpg
    image2.jpg
    ...
```

After processing:
```
images/
  my-project/     # Original images remain here
    image1.jpg
    image2.jpg
    ...
my-project/       # New directory with processed files
  image1.jpg
  image1.txt
  image2.jpg
  image2.txt
  ...
```

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP