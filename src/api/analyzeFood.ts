import { AIResponse } from '../types';

interface FoodAnalysis {
  name: string;
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

export const analyzeFood = async (foodName: string): Promise<AnalysisResponse> => {
  try {
    console.log('Sending request to analyze:', foodName);
    
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: foodName })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    // Проверяем, что получили валидный ответ
    if (!data || (data.calories === 0 && data.protein === 0 && data.fat === 0 && data.carbs === 0)) {
      console.log('Invalid or empty response data');
      return {
        success: false,
        error: 'Не удалось распознать продукт. Попробуйте уточнить название.'
      };
    }

    // Извлекаем количество граммов из названия
    const gramMatch = foodName.match(/(\d+)\s*(?:г|g|грамм|гр|gram|gr)/i);
    const portionGrams = gramMatch ? parseInt(gramMatch[1]) : 100;
    console.log('Detected portion:', portionGrams, 'grams');

    // Если в названии указаны граммы, пересчитываем значения
    const ratio = portionGrams / 100;

    const result = {
      success: true,
      analysis: {
        name: data.name || foodName,
        calories: Math.round(data.calories * ratio),
        protein: +(data.protein * ratio).toFixed(1),
        fat: +(data.fat * ratio).toFixed(1),
        carbs: +(data.carbs * ratio).toFixed(1),
        portion: portionGrams
      }
    };

    console.log('Processed result:', result);
    return result;

  } catch (error) {
    console.error('Error analyzing food:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return {
      success: false,
      error: 'Не удалось проанализировать блюдо. Попробуйте другое название или введите данные вручную.'
    };
  }
}; 