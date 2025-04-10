"use strict";
// import { Timestamp } from 'firebase/firestore'; // Removed unused import
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMealCategoryTitle = exports.formatDate = exports.MEAL_CATEGORIES = void 0;
exports.calculateNutritionGoals = calculateNutritionGoals;
// Define the constant first
const mealCategoriesArray = ['breakfast', 'lunch', 'dinner', 'snack'];
exports.MEAL_CATEGORIES = mealCategoriesArray;
const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
exports.formatDate = formatDate;
function calculateNutritionGoals(params) {
    // Restore implementation
    let bmr;
    if (params.gender === 'male') {
        bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age + 5;
    }
    else {
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
const getMealCategoryTitle = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
};
exports.getMealCategoryTitle = getMealCategoryTitle;
// */ // Remove end comment
// Ensure default export remains removed
/*
const Types = {
    MEAL_CATEGORIES: mealCategoriesArray,
};
export default Types;
*/ 
