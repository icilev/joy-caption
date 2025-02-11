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

1. Place your images in the `images` directory (it will be created automatically when you start the app)
2. Run the application with your desired output directory name:
   ```bash
   npm start <output-directory-name>
   ```
   For example:
   ```bash
   npm start my-captions
   ```

3. The application will:
   - Process all images from the `images` directory
   - Create a new directory with the name you specified
   - Save both images and their corresponding caption files in this directory
   - Each image will have a matching .txt file with the same name (e.g., `photo.jpg` → `photo.txt`)

## Custom Prompts

You can customize the captioning by creating a `.prompt` file in the `images` directory. The content of this file will be used as a starting point for all image captions. For example:

```bash
echo "an image of tom character" > images/.prompt
```

This will guide the AI model to focus on describing Tom's character in all images.

## Output Structure

For each processed image, you'll have two files in your output directory:
```
my-captions/
  image1.jpg     # The original image
  image1.txt     # The caption file
  image2.jpg
  image2.txt
  ...
```

Each text file contains the generated caption for its corresponding image.

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP