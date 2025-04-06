import type { AiSuggestion } from '@/types';
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