import { UserParameters, NutritionGoals } from '@/types';

export const calculateNutritionGoals = (params: UserParameters): NutritionGoals => {
  // Расчет BMR по формуле Миффлина-Сан Жеора
  const bmr = params.gender === 'male'
    ? 10 * params.weight + 6.25 * params.height - 5 * params.age + 5
    : 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;

  // Коэффициенты активности
  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }[params.activityLevel];

  // Расчет TDEE
  let tdee = Math.round(bmr * activityMultiplier);

  // Учет цели
  const goalMultiplier = {
    weight_loss: 0.85,
    maintenance: 1.0,
    weight_gain: 1.15
  }[params.goal];

  // Итоговая норма калорий
  const calories = Math.round(tdee * goalMultiplier);

  // Расчет БЖУ
  const proteinPerKg = params.goal === 'weight_loss' ? 1.8 : 1.5;
  const protein = Math.round(params.weight * proteinPerKg);
  const fat = Math.round(params.weight * 1); // 1г жиров на кг веса

  // Расчет углеводов (остаток калорий)
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);

  return {
    weight: params.weight,
    calories,
    protein,
    fat,
    carbs
  };
}; 