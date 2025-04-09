import { UserParams, NutritionData } from '@/types';

export function calculateNutritionGoals(params: UserParams): NutritionData {
  // Mifflin-St Jeor Equation
  const bmr = params.gender === 'male'
    ? 10 * params.weight + 6.25 * params.height - 5 * params.age + 5
    : 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderately_active: 1.55,
    active: 1.725,
    very: 1.9,
    very_active: 1.9,
    extra_active: 1.9
  }[params.activityLevel];

  // Goal adjustments
  const goalAdjustment = {
    weight_loss: 0.85,
    maintenance: 1.0,
    muscle_gain: 1.15,
    weight_gain: 1.15
  }[params.goal];

  // Calculate total calories
  const calories = Math.round(bmr * activityMultipliers * goalAdjustment);

  // Calculate macronutrients
  const protein = Math.round(params.weight * 1.8); // 1.8g per kg of body weight
  const fat = Math.round(params.weight * 1); // 1g per kg of body weight
  const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

  return {
    calories,
    protein,
    fat,
    carbs
  };
} 