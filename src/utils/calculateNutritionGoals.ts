import { UserParams, NutritionData } from '../types';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.9
};

const GOAL_MULTIPLIERS = {
  weight_loss: 0.85,    // -15% для похудения
  maintenance: 1.0,     // без изменений для поддержания
  muscle_gain: 1.15     // +15% для набора массы
};

export const calculateNutritionGoals = (params: UserParams): NutritionData => {
  // Расчет BMR по формуле Миффлина-Сан Жеора
  let bmr: number;
  if (params.gender === 'male') {
    bmr = (10 * params.weight) + (6.25 * params.height) - (5 * params.age) + 5;
  } else {
    bmr = (10 * params.weight) + (6.25 * params.height) - (5 * params.age) - 161;
  }

  // Расчет TDEE с учетом активности
  const activityMultiplier = ACTIVITY_MULTIPLIERS[params.activityLevel] || 1.2;
  const tdee = bmr * activityMultiplier;

  // Учет цели
  const goalMultiplier = GOAL_MULTIPLIERS[params.goal] || 1.0;
  const calories = Math.round(tdee * goalMultiplier);

  // Расчет БЖУ
  const proteinPerKg = params.goal === 'weight_loss' ? 2.2 : 1.8; // Больше белка при похудении
  const protein = Math.round(params.weight * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9); // 25% калорий из жиров
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Оставшиеся калории из углеводов

  return {
    weight: 0,
    calories,
    protein,
    fat,
    carbs
  };
}; 