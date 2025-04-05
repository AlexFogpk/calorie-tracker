import { AIResponse } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface FoodAnalysis {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: number;
}

interface AnalysisResponse {
  success: boolean;
  analysis?: FoodAnalysis;
  error?: string;
}

const SYSTEM_PROMPT = `Ты - эксперт по питанию. Анализируй блюда и определяй их пищевую ценность на 100 грамм.
Отвечай только в формате JSON с полями:
{
  "calories": число,
  "protein": число,
  "fat": число,
  "carbs": число,
  "portion": 100
}
Используй средние значения из надежных источников. Округляй до целых чисел.`;

const USER_PROMPT = (foodName: string) => `Проанализируй блюдо: ${foodName}`;

export const analyzeFood = async (foodName: string): Promise<AnalysisResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT(foodName) }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No analysis provided');
    }

    const analysis = JSON.parse(content);

    return {
      success: true,
      analysis: {
        calories: analysis.calories,
        protein: analysis.protein,
        fat: analysis.fat,
        carbs: analysis.carbs,
        portion: analysis.portion
      }
    };
  } catch (error) {
    console.error('Error analyzing food:', error);
    return {
      success: false,
      error: 'Не удалось проанализировать блюдо. Попробуйте другое название или введите данные вручную.'
    };
  }
}; 