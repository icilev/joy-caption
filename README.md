# Joy Caption

A comprehensive toolkit for preparing and managing image datasets for LoRA training, featuring automated captioning, resizing, and formatting capabilities.

## Overview

Joy Caption streamlines the process of preparing images for LoRA training through four main steps:
1. Resize images to the required dimensions
2. Generate detailed captions using GPT-4-Vision
3. Standardize captions with Mistral AI
4. Prepare the final dataset for LoRA training

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key_here
   MISTRAL_API_KEY=your_mistral_key_here
   ```

## Requirements

- Node.js 18+
- OpenAI API key (for GPT-4-Vision)
- Mistral AI API key (for caption modification)

## Step-by-Step Process

### 1. Resize Images

Prepare your images by resizing them to the required dimensions:

```bash
node resize.js <input-folder> <size>
```

Example:
```bash
node resize.js my-project 1024
```

This will:
- Take images from `images/my-project`
- Create `output/my-project-1024`
- Resize each image to 1024x1024 pixels
- Center and crop images to maintain square aspect ratio

### 2. Generate Captions

Create detailed image descriptions using GPT-4-Vision:

```bash
node index.js <folder-name>
```

Example:
```bash
node index.js my-project-1024
```

Features:
- Processes all images in the specified directory
- Creates matching .txt files for each image
- Generates detailed, contextual descriptions
- Supports custom prompts for specific description styles

### 3. Modify Captions

Standardize captions with consistent character references:

```bash
node modify-captions.js <folder-name> <character-name>
```

Example:
```bash
node modify-captions.js my-project-1024 "chonky"
```

This will:
- Start each caption with "An image of <character-name> character"
- Replace character references with the specified name
- Maintain detailed descriptions and style
- Preserve important context and details

### 4. Prepare for LoRA Training

Finalize the dataset for training:

```bash
node train.js <folder-name>
```

Example:
```bash
node train.js my-project-1024
```

The script will:
- Verify image dimensions (must be 1024x1024)
- Check caption formatting
- Create the final training dataset
- Generate a zip file ready for training

## Training Tips

### Image Selection
- Use 12-18 images for optimal results
- Ensure consistent quality and style
- Include varied poses and expressions
- Maintain consistent character features

### Character LoRAs
- Include different expressions and backgrounds
- Keep consistent character features (age, hair, etc.)
- Pair trigger word with gender in prompts

### Style LoRAs
- Select images with consistent style elements
- Use varied subjects while maintaining style
- Consider reducing LoRA strength to 0.8-0.95

## Directory Structure

```
project/
├── images/                 # Input directory
│   └── my-project/        # Your source images
│       ├── photo1.jpg
│       └── photo2.png
│
└── output/                # Generated files
    ├── my-project-1024/  # Processed images
    │   ├── 1.jpg         # Resized image
    │   ├── 1.txt         # Image caption
    │   ├── 2.jpg
    │   └── 2.txt
    └── my-project.zip    # Training dataset
```

## Supported Formats

- Images: JPG/JPEG, WebP
- Captions: UTF-8 text files

## License

When using FLUX.1 models and their fine-tunes:
- Commercial use allowed for images generated ON Replicate
- Non-commercial use only for images generated OFF Replicate
- LoRA models inherit FLUX.1-dev base model license