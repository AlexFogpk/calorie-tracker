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

// Simplified validation focusing on essential fields and types
function validateMinimalAiResponse(data: unknown): data is Partial<NutritionData> {
  if (!data || typeof data !== 'object') {
    console.warn('AI Response: Invalid data type:', typeof data);
    return false;
  }

  // Check for at least one numeric field to consider it potentially valid
  const numericFields = ['calories', 'protein', 'fat', 'carbs', 'weight'];
  const hasAtLeastOneNumber = numericFields.some(field => 
    Object.prototype.hasOwnProperty.call(data, field) && 
    typeof (data as any)[field] === 'number' && 
    !isNaN((data as any)[field])
  );

  if (!hasAtLeastOneNumber) {
     console.warn('AI Response: Does not contain any valid numeric nutrition fields.', data);
     return false;
  }

  // Check name if present
  if (Object.prototype.hasOwnProperty.call(data, 'name') && typeof (data as any).name !== 'string') {
      console.warn('AI Response: Invalid name type:', typeof (data as any).name);
      return false;
  }

  return true;
}

// API endpoint for meal analysis
const analyzeMealHandler: express.RequestHandler = async (req, res): Promise<void> => {
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

    let nutritionData: any;
    try {
      nutritionData = JSON.parse(content);
      console.log('Raw AI response content:', content);
      console.log('Parsed nutrition data:', nutritionData);
      
      // Use simplified validation
      if (!validateMinimalAiResponse(nutritionData)) {
        console.error('Invalid or incomplete nutrition data format from AI:', nutritionData);
        // Return a specific error instead of generic empty object
        res.status(400).json({
          success: false,
          error: 'Invalid data format received from AI analysis.',
          raw_content: process.env.NODE_ENV === 'development' ? content : undefined
        });
        return;
      }
      
      // Safely extract and normalize data, providing defaults
      const safeData: NutritionData = {
        weight: Math.round(Number(nutritionData.weight) || 100),
        calories: Math.round(Number(nutritionData.calories) || 0),
        protein: Math.round(Number(nutritionData.protein) || 0),
        fat: Math.round(Number(nutritionData.fat) || 0),
        carbs: Math.round(Number(nutritionData.carbs) || 0)
      };
      
      // Optional: Add basic sanity checks (e.g., calories > 0 if weight > 0)
      if (safeData.weight > 0 && safeData.calories === 0 && safeData.protein === 0 && safeData.fat === 0 && safeData.carbs === 0) {
         console.warn('AI returned zero nutrition for non-zero weight:', safeData);
         // Decide if this should be treated as an error or just logged
      }

      console.log('Validated and normalized data:', safeData);
      res.json(safeData); // Send the safely extracted data
      return;
    } catch (error) {
      console.error('Failed to parse or validate AI response:', error);
      console.error('Raw content that failed parsing:', content);
      res.status(500).json({
        success: false,
        error: 'Failed to process AI response.',
        raw_content: process.env.NODE_ENV === 'development' ? content : undefined
      });
      return;
    }
  } catch (error) {
    console.error('\n--- Error in meal analysis handler ---');
    console.error('Error Type:', typeof error);
    console.error('Error Name:', (error instanceof Error ? error.name : 'N/A'));
    console.error('Error Message:', (error instanceof Error ? error.message : 'N/A'));
    
    // Attempt to log specific potentially relevant properties
    if (typeof error === 'object' && error !== null) {
      console.error('Error Properties (if any):', Object.keys(error));
      if ('status' in error) console.error('Error Status:', (error as any).status);
      if ('code' in error) console.error('Error Code:', (error as any).code);
      // Log potentially nested error details from OpenAI library
      if ('error' in error && typeof (error as any).error === 'object') {
         console.error('Nested Error Object:', JSON.stringify((error as any).error, null, 2));
      }
    }

    // Try logging the raw error object directly (might show more in some consoles)
    console.error('Raw Error Object:', error);

    // Attempt stringify again, but catch potential errors
    try {
      console.error('Full Error Object (Stringified):', JSON.stringify(error, null, 2));
    } catch (stringifyError) {
      console.error('Could not stringify the full error object:', stringifyError);
    }
    
    if (error instanceof Error) {
      console.error('Error Stack:', error.stack);
    }

    // General fallback error response
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during analysis.'
    });
  }
};

router.post('/analyze-meal', analyzeMealHandler);

export default router; 