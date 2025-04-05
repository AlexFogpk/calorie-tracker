import { Timestamp } from 'firebase/firestore';

export type MealCategory = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус';

export const MEAL_CATEGORIES: MealCategory[] = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

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

export interface NutritionData {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface UserParameters {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface AiSuggestion {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MainMenuScreenProps {
  goals: NutritionData;
  meals: Record<MealCategory, Meal[]>;
  onAddMeal: () => void;
  onEditMeal: (meal: Meal) => void;
  onUpdateGoals: (goals: NutritionData) => Promise<void>;
}

export interface AIAnalysis {
  portion: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
}

export interface AIResponse {
  success: boolean;
  analysis?: AIAnalysis;
  error?: string;
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
};

export function calculateNutritionGoals(params: UserParameters): NutritionGoals {
  // Базовый обмен веществ (формула Миффлина-Сан Жеора)
  let bmr;
  if (params.gender === 'male') {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age + 5;
  } else {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;
  }

  // Коэффициент активности
  const activityMultiplier = {
    low: 1.2,
    medium: 1.55,
    high: 1.9
  }[params.activityLevel];

  // Суточная норма калорий
  const calories = Math.round(bmr * activityMultiplier);

  // Распределение макронутриентов
  const protein = Math.round(params.weight * 2); // 2г белка на кг веса
  const fat = Math.round((calories * 0.25) / 9); // 25% калорий из жиров
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Оставшиеся калории из углеводов

  return {
    calories,
    protein,
    fat,
    carbs
  };
}

export const getMealCategoryTitle = (category: MealCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
}; 