// import { Timestamp } from 'firebase/firestore'; // Removed unused import

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Define the constant first
const mealCategoriesArray: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

// Use named export
export { mealCategoriesArray as MEAL_CATEGORIES };

// Uncomment everything else 
// /* // Remove start comment
export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  timestamp: Date;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight: number;
}

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very';

export type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain';

export interface UserParameters {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface NutritionGoals extends NutritionData {}

export interface UserParams extends UserParameters {}

// Define and export UserProfile interface
export interface UserProfile {
  name?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: Gender; // Use existing Gender type
  activityLevel?: ActivityLevel; // Use existing ActivityLevel type
  goal?: Goal; // Use existing Goal type
  goals?: NutritionGoals; // Use existing NutritionGoals type
}

export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  params?: UserParams;
  goals?: NutritionGoals;
}

export interface AiSuggestion {
  success: boolean;
  analysis?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    portion: number;
    weight: number;
  };
  error?: string;
  timestamp: number;
}

export interface MainMenuScreenProps {
  goals: NutritionData;
  meals: Record<MealCategory, Meal[]>;
  onAddMeal: () => void;
  onEditMeal: (meal: Meal) => void;
  onUpdateGoals: (goals: NutritionData) => Promise<void>;
}

export interface AIAnalysis {
  success: boolean;
  analysis?: NutritionData;
  error?: string;
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
  // Restore implementation
  let bmr;
  if (params.gender === 'male') {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age + 5;
  } else {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;
  }
  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very: 1.9
  }[params.activityLevel];
  const calories = Math.round(bmr * activityMultiplier);
  const protein = Math.round(params.weight * 2); 
  const fat = Math.round((calories * 0.25) / 9); 
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
  return {
    weight: 0,
    calories,
    protein,
    fat,
    carbs
  };
}

export const getMealCategoryTitle = (category: MealCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};
// */ // Remove end comment

// Ensure default export remains removed
/*
const Types = {
    MEAL_CATEGORIES: mealCategoriesArray,
};
export default Types; 
*/ 