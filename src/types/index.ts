export type MealCategory = '🍳 Завтрак' | '🍲 Обед' | '🍝 Ужин' | '🍽 Перекус';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category: MealCategory;
  timestamp: Date;
}

export interface DailyIntake {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const MEAL_CATEGORIES: MealCategory[] = ['🍳 Завтрак', '🍲 Обед', '🍝 Ужин', '🍽 Перекус'];

// Утилита для форматирования даты
export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  }
}; 