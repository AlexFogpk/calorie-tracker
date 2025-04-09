import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import { NutritionData, AIAnalysis } from '../types';

dotenv.config();

const router = express.Router();

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validate AI response
function validateAiResponse(data: any): data is NutritionData {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data type:', typeof data);
    return false;
  }

  const requiredFields = ['calories', 'protein', 'fat', 'carbs', 'weight', 'name'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
    
    if (field === 'name') {
      if (typeof data[field] !== 'string') {
        console.error(`Invalid name type: ${typeof data[field]}`);
        return false;
      }
      continue;
    }
    
    if (typeof data[field] !== 'number' || isNaN(data[field]) || data[field] < 0) {
      console.error(`Invalid ${field} value:`, data[field]);
      return false;
    }
  }

  const limits = {
    calories: 5000,
    protein: 200,
    fat: 200,
    carbs: 400,
    weight: 10000
  };

  for (const [field, limit] of Object.entries(limits)) {
    if (data[field] > limit) {
      console.error(`${field} exceeds limit:`, data[field], '>', limit);
      return false;
    }
  }

  return true;
}

// API endpoint for meal analysis
const analyzeMealHandler: express.RequestHandler = async (req, res) => {
  try {
    const { description } = req.body;
    console.log('Analyzing meal:', description);

    if (!description) {
      res.status(400).json({ 
        error: 'Description is required',
        message: 'Пожалуйста, введите название блюда'
      });
      return;
    }

    console.log('Making OpenAI request...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Ты — эксперт по питательной ценности продуктов.

🎯 Твоя задача — рассчитать массу и КБЖУ (калории, белки, жиры, углеводы) на указанное блюдо или продукт.

📏 Правила определения массы (weight):

1. Если указан точный вес в граммах:
   "гречка 150 г" → weight = 150
   "рис 200г" → weight = 200

2. Если указано количество в штуках/порциях — оцени реальную массу:
   "3 яблока" → weight ≈ 450 (примерно 150г каждое)
   "2 куриных яйца" → weight ≈ 120 (примерно 60г каждое)
   "4 пельменя" → weight ≈ 60 (примерно 15г каждый)

3. Если указаны столовые приборы — используй стандартные меры:
   "столовая ложка масла" → weight ≈ 15-20
   "чайная ложка сахара" → weight ≈ 5-7

4. Если указана порция — используй типичный размер порции:
   "порция борща" → weight ≈ 300-350
   "тарелка риса" → weight ≈ 200-250
   "кусок пиццы" → weight ≈ 150-180

5. Если продукт указан без количества:
   - используй стандартную порцию 100г
   - укажи weight = 100

❗ Важно: всегда оценивай и возвращай массу в граммах в поле weight!

📦 Формат ответа (строго JSON):
{
  "name": "Название продукта",
  "weight": число,  // масса в граммах
  "calories": число,
  "protein": число,
  "fat": число,
  "carbs": число
}

📌 Примеры:
"гречка 150 г" →
{"name": "Гречка", "weight": 150.0, "calories": 469.5, "protein": 18.9, "fat": 5.0, "carbs": 93.0}

"2 пельменя" →
{"name": "Пельмени", "weight": 30.0, "calories": 90.0, "protein": 5.0, "fat": 3.5, "carbs": 8.0}

"3 яблока" →
{"name": "Яблоки", "weight": 450.0, "calories": 234.0, "protein": 1.1, "fat": 0.7, "carbs": 57.2}

"столовая ложка масла" →
{"name": "Масло растительное", "weight": 17.0, "calories": 153.0, "protein": 0.0, "fat": 17.0, "carbs": 0.0}

"банан" →
{"name": "Банан", "weight": 100.0, "calories": 89.0, "protein": 1.1, "fat": 0.3, "carbs": 22.8}

"блюдо неизвестное" →
{"name": "", "weight": 0.0, "calories": 0.0, "protein": 0.0, "fat": 0.0, "carbs": 0.0}`
        },
        {
          role: 'user',
          content: description
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    // Подробное логирование ответа OpenAI
    console.log('OpenAI response details:', {
      id: response.id,
      model: response.model,
      created: response.created,
      choices: response.choices.map(choice => ({
        index: choice.index,
        finishReason: choice.finish_reason,
        hasContent: !!choice.message.content,
        contentLength: choice.message.content?.length || 0
      }))
    });

    // Проверяем наличие ответа
    if (!response.choices || response.choices.length === 0) {
      console.error('OpenAI response has no choices:', response);
      res.status(500).json({
        error: 'Invalid AI response',
        message: 'Не удалось получить ответ от AI. Попробуйте позже.',
        debug: process.env.NODE_ENV === 'development' ? { response } : undefined
      });
      return;
    }

    const content = response.choices[0].message.content;
    
    // Проверяем content на null/undefined/пустую строку
    if (!content || content.trim() === '') {
      console.error('Empty or invalid content from OpenAI:', {
        content,
        choice: response.choices[0]
      });
      
      res.json({
        name: "",
        weight: 0,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      });
      return;
    }

    let nutritionData: unknown;
    try {
      nutritionData = JSON.parse(content);
      console.log('Raw AI response content:', content);
      console.log('Parsed nutrition data:', nutritionData);
      
      // Validate the parsed data
      if (!validateAiResponse(nutritionData)) {
        console.error('Invalid nutrition data format:', nutritionData);
        throw new Error('Invalid AI response format');
      }
      
      // Ensure all numeric fields are numbers
      const validatedData: NutritionData = {
        name: nutritionData.name,
        weight: Number(nutritionData.weight),
        calories: Number(nutritionData.calories),
        protein: Number(nutritionData.protein),
        fat: Number(nutritionData.fat),
        carbs: Number(nutritionData.carbs)
      };
      
      console.log('Validated and normalized data:', validatedData);
      res.json(validatedData);
    } catch (error) {
      console.error('Failed to process AI response:', error);
      console.error('Raw content:', content);
      
      res.json({
        name: "",
        weight: 0,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      });
    }
  } catch (error) {
    console.error('Error in meal analysis:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.hasOwnProperty('response') ? (error as any).response : undefined
      });
    }
    
    res.json({
      name: "",
      weight: 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    });
  }
};

router.post('/analyze-meal', analyzeMealHandler);

export default router; 