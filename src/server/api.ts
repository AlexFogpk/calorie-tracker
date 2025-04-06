import express, { Request, Response, Router, RequestHandler } from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const router: Router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// Validate AI response
function validateAiResponse(data: any): data is NutritionData {
  if (!data || typeof data !== 'object') return false;

  const requiredFields = ['name', 'calories', 'protein', 'fat', 'carbs'];
  
  for (const field of requiredFields) {
    if (!(field in data)) return false;
    
    if (field === 'name') {
      if (typeof data[field] !== 'string' || !data[field].trim()) return false;
    } else {
      if (typeof data[field] !== 'number' || data[field] < 0) return false;
    }
  }

  const limits = {
    calories: 5000,
    protein: 200,
    fat: 200,
    carbs: 400
  };

  for (const [field, limit] of Object.entries(limits)) {
    if (data[field] > limit) return false;
  }

  return true;
}

// API endpoint for meal analysis
const analyzeMealHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description } = req.body;

    if (!description) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert. Analyze the food description and provide nutritional information in JSON format. Include calories, protein, fat, and carbs in grams. Be accurate and realistic with your estimates.'
        },
        {
          role: 'user',
          content: description
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      res.status(500).json({ error: 'No response received from AI' });
      return;
    }

    let nutritionData: unknown;
    try {
      nutritionData = JSON.parse(content);
    } catch (error) {
      res.status(500).json({ error: 'Invalid response format from AI' });
      return;
    }

    if (!validateAiResponse(nutritionData)) {
      res.status(500).json({ error: 'Invalid nutritional values received' });
      return;
    }

    res.json(nutritionData);
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
};

router.post('/analyze-meal', analyzeMealHandler);

export default router; 