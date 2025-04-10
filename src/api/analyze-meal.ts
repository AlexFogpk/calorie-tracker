import type { AiSuggestion, NutritionData } from '../types';
import { mealCacheService } from '../services/mealCache';

export async function analyzeMeal(description: string): Promise<AiSuggestion> {
  console.log('Starting meal analysis for:', description);
  
  // Check cache first
  const cached = mealCacheService.getCachedMeal(description);
  if (cached) {
    console.log('Returning cached result for:', description);
    return cached;
  }

  try {
    console.log('Making API request to backend...');
    
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze meal');
    }

    const nutritionData = await response.json();
    console.log('Raw nutrition data from API:', nutritionData);

    // Validate and safely handle undefined values
    if (!nutritionData || typeof nutritionData !== 'object') {
      throw new Error('Invalid nutrition data received');
    }

    // Round all numeric values with nullish coalescing
    const roundedData = {
      success: true,
      analysis: {
        calories: Math.round(nutritionData.calories ?? 0),
        protein: Math.round(nutritionData.protein ?? 0),
        fat: Math.round(nutritionData.fat ?? 0),
        carbs: Math.round(nutritionData.carbs ?? 0),
        portion: Math.round(nutritionData.weight ?? 100),
        weight: Math.round(nutritionData.weight ?? 100)
      },
      timestamp: Date.now()
    };

    console.log('Rounded data:', roundedData);

    // Cache the valid result
    mealCacheService.cacheMeal(description, roundedData);
    mealCacheService.addToHistory(description, roundedData);

    return roundedData;
  } catch (error) {
    console.error('Ошибка анализа еды:', error);
    return {
      success: false,
      error: 'Не удалось проанализировать блюдо',
      timestamp: Date.now()
    };
  }
} 