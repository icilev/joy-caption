import express from 'express';
import multer from 'multer';
import cors from 'cors';
import sharp from 'sharp';
import { OpenAI } from 'openai';
import MistralClient from '@mistralai/mistralai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.static('web'));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Route pour le traitement des images
app.post('/process', upload.array('images'), async (req, res) => {
    try {
        const results = [];

        for (const file of req.files) {
            // Redimensionner l'image
            const resizedImageBuffer = await sharp(file.buffer)
                .resize(1024, 1024, {
                    fit: 'cover',
                    position: 'center'
                })
                .toBuffer();

            // Convertir en base64 pour GPT-4-Vision
            const base64Image = resizedImageBuffer.toString('base64');

            // Générer la légende avec GPT-4-Vision
            const completion = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Décrivez cette image en détail." },
                            {
                                type: "image_url",
                                image_url: `data:image/jpeg;base64,${base64Image}`
                            }
                        ],
                    },
                ],
                max_tokens: 300,
            });

            let caption = completion.choices[0].message.content;

            // Modifier la légende avec Mistral
            const mistralResponse = await mistral.chat({
                model: "mistral-large-latest",
                messages: [
                    {
                        role: "system",
                        content: "Tu es un expert en description d'images. Ta tâche est d'améliorer et de standardiser les légendes d'images pour l'entraînement de modèles LoRA."
                    },
                    {
                        role: "user",
                        content: `Améliore cette légende d'image en la rendant plus précise et descriptive : ${caption}`
                    }
                ],
                temperature: 0.7,
            });

            caption = mistralResponse.choices[0].message.content;

            results.push({
                filename: file.originalname,
                caption,
                image: `data:${file.mimetype};base64,${resizedImageBuffer.toString('base64')}`
            });
        }

        res.json(results);
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
