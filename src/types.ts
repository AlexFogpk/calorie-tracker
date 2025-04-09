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
  grams: number;
  category: MealCategory;
  timestamp: Date;
}

export interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 
  | 'sedentary'
  | 'light'
  | 'moderately_active'
  | 'active'
  | 'very_active'
  | 'extra_active';
export type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'weight_gain';

export interface UserParameters {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface UserParams {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  params?: UserParams;
}

export interface AiSuggestion {
  success: boolean;
  analysis?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    portion: number;
  };
  error?: string;
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
    month: 'long',
    year: 'numeric'
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
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very: 1.9
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