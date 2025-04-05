import OpenAI from 'openai';
import type { AiSuggestion } from '@/types';
import { mealCacheService } from '../services/mealCache';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Improved API key validation
function isValidApiKey(key: string | undefined): boolean {
  return Boolean(key && key.length > 20);
}

if (!isValidApiKey(API_KEY)) {
  console.error('Invalid or missing OpenAI API key. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: 'https://api.openai.com/v1'
});

function validateAiResponse(data: any): data is AiSuggestion {
  if (!data || typeof data !== 'object') return false;

  const requiredFields: (keyof AiSuggestion)[] = ['name', 'calories', 'protein', 'fat', 'carbs'];
  
  // Check if all required fields exist and have correct types
  for (const field of requiredFields) {
    if (!(field in data)) return false;
    
    if (field === 'name') {
      if (typeof data[field] !== 'string' || !data[field].trim()) return false;
    } else {
      if (typeof data[field] !== 'number' || data[field] < 0) return false;
    }
  }

  // Additional validation for reasonable values
  const limits = {
    calories: 5000, // Max reasonable calories per meal
    protein: 200,   // Max protein in grams
    fat: 200,       // Max fat in grams
    carbs: 400      // Max carbs in grams
  };

  for (const [field, limit] of Object.entries(limits)) {
    if (data[field as keyof typeof limits] > limit) return false;
  }

  return true;
}

export async function analyzeMeal(description: string): Promise<AiSuggestion> {
  console.log('Starting meal analysis for:', description);
  
  if (!isValidApiKey(API_KEY)) {
    console.error('API Key validation failed');
    throw new Error('OpenAI API key is not properly configured. Please check your .env file.');
  }

  // Check cache first
  const cached = mealCacheService.getCachedMeal(description);
  if (cached) {
    console.log('Returning cached result for:', description);
    return cached;
  }

  try {
    console.log('Making API request to OpenAI...');
    
    // Add headers to handle CORS
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

    console.log('Received response from OpenAI');
    const content = response.choices[0].message.content;
    if (!content) {
      console.error('No content in response');
      throw new Error('No response received from AI. Please try again.');
    }

    console.log('Raw AI response:', content);
    let nutritionData: unknown;
    try {
      nutritionData = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse JSON response:', content);
      throw new Error('Invalid response format from AI. Please try again.');
    }

    if (!validateAiResponse(nutritionData)) {
      console.error('Response validation failed:', nutritionData);
      throw new Error('Invalid nutritional values received. Please try again or enter manually.');
    }

    // Round all numeric values
    const roundedData: AiSuggestion = {
      name: nutritionData.name,
      calories: Math.round(nutritionData.calories),
      protein: Math.round(nutritionData.protein),
      fat: Math.round(nutritionData.fat),
      carbs: Math.round(nutritionData.carbs)
    };

    console.log('Successfully processed meal data:', roundedData);

    // Cache the valid result
    mealCacheService.cacheMeal(description, roundedData);
    // Add to history
    mealCacheService.addToHistory(description, roundedData);

    return roundedData;
  } catch (error) {
    console.error('Ошибка анализа еды:', error);
    throw new Error('Не удалось проанализировать блюдо');
  }
} 