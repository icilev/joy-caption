import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import ora from 'ora';

dotenv.config();

// Get input directory name and character name from command line arguments
const inputDir = process.argv[2];
const characterName = process.argv[3];

if (!inputDir || !characterName) {
  console.error('Please provide all required arguments.');
  console.error('Usage: node modify-captions.js <directory-name> <character-name>');
  console.error('Example: node modify-captions.js my-project "chonky"');
  console.error('The directory should exist in the output folder.');
  process.exit(1);
}

if (!process.env.MISTRAL_API_KEY) {
  console.error('Error: MISTRAL_API_KEY not found in .env file');
  console.error('Please add your Mistral API key to the .env file:');
  console.error('MISTRAL_API_KEY=your_key_here');
  process.exit(1);
}

// Set up paths
const outputPath = path.join('./output', inputDir);

// Helper function to wait between API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function improveCaption(caption, retries = 3) {
  const prefix = `An image of ${characterName} character`;
  const prompt = `
Reformule cette légende d'image en commençant EXACTEMENT par "${prefix}". 
Remplace toute référence au personnage principal par "${characterName}".
Garde tous les détails importants et le style descriptif.

Légende originale : ${caption}

Réponds uniquement avec la nouvelle légende, sans autre texte.`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [{
            role: "system",
            content: "Tu es un expert en rédaction de légendes d'images. Tu dois toujours commencer par le préfixe exact demandé et reformuler le reste en gardant le sens et les détails."
          }, {
            role: "user",
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (response.status === 429) {
        const waitTime = (i + 1) * 2000;
        console.log(`Rate limited. Waiting ${waitTime/1000}s before retry...`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();

    } catch (error) {
      if (i === retries - 1) {
        console.error('Error improving caption:', error);
        return caption;
      }
      await sleep(1000);
    }
  }
  return caption;
}

async function modifyCaptions() {
  const spinner = ora('Modifying captions...').start();
  
  try {
    // Read all files in the directory
    const files = await readdir(outputPath);
    const captionFiles = files.filter(file => file.endsWith('.txt')).sort();
    let modifiedCount = 0;

    console.log(`Found ${captionFiles.length} caption files.\n`);

    for (const file of captionFiles) {
      spinner.text = `Processing ${file}...`;
      const filePath = path.join(outputPath, file);
      const caption = await readFile(filePath, 'utf8');
      
      // Improve the caption using Mistral AI
      const newCaption = await improveCaption(caption);
      
      // Save the modified caption
      await writeFile(filePath, newCaption);
      modifiedCount++;
      
      // Add a small delay between requests to avoid rate limiting
      await sleep(1000);
    }

    spinner.succeed(`Successfully modified ${modifiedCount} captions.`);
  } catch (error) {
    spinner.fail('Failed to modify captions');
    console.error(error);
    process.exit(1);
  }
}

// Start the process
console.log('🚀 Starting Caption Modification with Mistral AI...\n');
modifyCaptions();
