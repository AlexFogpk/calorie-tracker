import { AIResponse } from '../types';

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

export const analyzeFood = async (foodName: string): Promise<AnalysisResponse> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: foodName })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    return {
      success: true,
      analysis: {
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        portion: 100
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