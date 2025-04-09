import { UserParams, NutritionData } from '@/types';

export function calculateNutritionGoals(params: UserParams): NutritionData {
  // Calculate BMR using Harris-Benedict equation
  const bmr = params.gender === 'male'
    ? 88.362 + (13.397 * params.weight) + (4.799 * params.height) - (5.677 * params.age)
    : 447.593 + (9.247 * params.weight) + (3.098 * params.height) - (4.330 * params.age);

  // Activity multiplier
  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very: 1.9
  }[params.activityLevel];

  // Calculate maintenance calories
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  // Adjust calories based on goal
  const calories = Math.round(maintenanceCalories * {
    weight_loss: 0.85,
    maintenance: 1,
    muscle_gain: 1.15
  }[params.goal]);

  // Calculate macronutrients
  const protein = Math.round(params.weight * 2.2); // 2.2g per kg of body weight
  const fat = Math.round(calories * 0.25 / 9); // 25% of calories from fat
  const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

  return {
    calories,
    protein,
    fat,
    carbs
  };
} 