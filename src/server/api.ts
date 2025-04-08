import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

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

🎯 Твоя задача — рассчитать КБЖУ (калории, белки, жиры, углеводы) на указанное блюдо или продукт.

📏 Правила:
1. Если указано точное количество в граммах — используй его напрямую.
   Пример: "гречка 150 г" → считаешь КБЖУ на 150 г.
2. Если указано количество в штуках, порциях, упаковках — оцени массу сам по своему опыту.
   Примеры:
   - 1 яйцо ≈ 60 г
   - 1 сырник ≈ 70 г
   - 1 пельмень ≈ 15 г
   - 1 ложка ≈ 20 г
   - 1 порция супа ≈ 300 г
3. Если масса не указана и ты не можешь определить — считай КБЖУ на 100 г по умолчанию.
4. Возвращай данные на всё указанное количество продукта.
5. Все значения округляй до 1 знака после запятой.
6. Формат ответа — строго JSON, без пояснений и текста.

📦 Формат:
{
  "name": "Название продукта",
  "calories": число,
  "protein": число,
  "fat": число,
  "carbs": число
}

📌 Примеры:
"гречка 100 г" →
{"name": "Гречка", "calories": 313, "protein": 12.6, "fat": 3.3, "carbs": 62.0}

"2 пельменя" →
{"name": "Пельмени", "calories": 90, "protein": 5.0, "fat": 3.5, "carbs": 8.0}

"блюдо неизвестное" →
{"name": "", "calories": 0, "protein": 0, "fat": 0, "carbs": 0}`
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
      console.log('Parsed nutrition data:', nutritionData);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw content:', content);
      
      res.json({
        name: "",
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      });
      return;
    }

    if (!validateAiResponse(nutritionData)) {
      console.error('Invalid nutrition data format:', {
        data: nutritionData,
        validationError: 'Response does not match expected schema'
      });
      
      res.json({
        name: "",
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      });
      return;
    }

    console.log('Sending response:', nutritionData);
    res.json(nutritionData);
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
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    });
  }
};

router.post('/analyze-meal', analyzeMealHandler);

export default router; 