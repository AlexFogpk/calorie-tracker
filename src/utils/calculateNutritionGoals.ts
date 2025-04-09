import { UserParams, NutritionData } from '@/types';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.9,
  extra_active: 2.0
};

const GOAL_MULTIPLIERS = {
  weight_loss: 0.8,
  maintenance: 1.0,
  muscle_gain: 1.1,
  weight_gain: 1.2
};

export const calculateNutritionGoals = (params: UserParams): NutritionData => {
  // Calculate BMR (Basal Metabolic Rate)
  let bmr: number;
  if (params.gender === 'male') {
    bmr = 88.362 + (13.397 * params.weight) + (4.799 * params.height) - (5.677 * params.age);
  } else {
    bmr = 447.593 + (9.247 * params.weight) + (3.098 * params.height) - (4.330 * params.age);
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = ACTIVITY_MULTIPLIERS[params.activityLevel] || 1.2;
  const goalMultiplier = GOAL_MULTIPLIERS[params.goal] || 1.0;
  const tdee = bmr * activityMultiplier * goalMultiplier;

  // Calculate macronutrient distribution
  const protein = Math.round(params.weight * 2.2); // 2.2g per kg of body weight
  const fat = Math.round((tdee * 0.25) / 9); // 25% of calories from fat
  const carbs = Math.round((tdee - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

  return {
    calories: Math.round(tdee),
    protein,
    fat,
    carbs
  };
}; 