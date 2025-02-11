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
2. Start the application:
   ```bash
   node index.js
   ```
3. (Optional) Create a `.prompt` file in the `images` directory with your custom prompt:
   ```bash
   echo "an image of tom character" > images/.prompt
   ```
4. To process all images in the directory, create a file named `.process_images` in the `images` directory:
   ```bash
   touch images/.process_images
   ```
5. The application will process all images and:
   - Save individual captions in the `captions` directory as text files
   - Save all captions collectively in `captions.json`

## Custom Prompts

You can customize the captioning by creating a `.prompt` file in the `images` directory. The content of this file will be used as a starting point for all image captions. For example:

```bash
echo "an image of tom character" > images/.prompt
```

This will guide the AI model to focus on describing Tom's character in all images.

## Output Formats

### Individual Caption Files

For each image, a corresponding text file will be created in the `captions` directory:
```
captions/
  image1.txt
  image2.txt
  ...
```

Each text file contains:
```
Prompt: an image of tom character
Caption: [generated caption]
```

### JSON Output

All captions are also saved to `captions.json` in the following format:
```json
{
  "image1.jpg": {
    "caption": "generated caption for image 1",
    "prompt": "an image of tom character"
  },
  "image2.png": {
    "caption": "generated caption for image 2",
    "prompt": "an image of tom character"
  }
}
```

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP