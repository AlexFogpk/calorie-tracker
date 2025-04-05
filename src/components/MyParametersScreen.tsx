import React from 'react';
import MyParametersForm from './MyParametersForm';
import type { NutritionData } from '@/types';
// Import shared types if needed (or define locally if only used here)

interface MyParametersScreenProps {
    onGoalsCalculated: (goals: NutritionData) => void;
}

// Keep FormData interface from MyParametersForm if needed or define inline
interface FormData {
  name: string;
  gender: 'Male' | 'Female' | '';
  age: number | '';
  height: number | '';
  weight: number | '';
  activityLevel: 'Low' | 'Medium' | 'High' | '';
  goal: 'Lose weight' | 'Maintain' | 'Gain muscle' | '';
}


const MyParametersScreen: React.FC<MyParametersScreenProps> = ({ onGoalsCalculated }) => {

  const handleCalculate = (formData: FormData) => {
    console.log('Calculating nutrition using Harris-Benedict for:', formData);

    // Ensure values are numbers for calculation
    const weight = Number(formData.weight);
    const height = Number(formData.height);
    const age = Number(formData.age);

    if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
        alert("Please enter valid numeric values for age, height, and weight.");
        return;
    }


    // --- Calculation Logic (Harris-Benedict as implemented before) ---
    let bmr: number;
     if (formData.gender === 'Male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else { // Female
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }


    let activityMultiplier: number;
    switch (formData.activityLevel) {
      case 'Low': activityMultiplier = 1.55; break; // Mapped to Light
      case 'Medium': activityMultiplier = 1.725; break; // Mapped to Moderate
      case 'High': activityMultiplier = 1.9; break; // Mapped to Very Active
      default: activityMultiplier = 1.55; // Default to Light
    }

    let maintenanceCalories = bmr * activityMultiplier;
    let targetCalories = maintenanceCalories;
     if (formData.goal === 'Lose weight') targetCalories -= 500; // Example deficit
    else if (formData.goal === 'Gain muscle') targetCalories += 300; // Example surplus

    // Protein: 2g per kg of body weight
    const proteins = Math.round(2 * weight);
    const proteinCalories = proteins * 4; // 4 kcal per gram of protein

    // Fat: 25% of total calories
    const fatCalories = targetCalories * 0.25;
    const fats = Math.round(fatCalories / 9); // 9 kcal per gram of fat

    // Carbs: Remaining calories
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    // Ensure carb calories are not negative if protein/fat percentages are high
    const safeCarbCalories = Math.max(0, carbCalories);
    const carbs = Math.round(safeCarbCalories / 4); // 4 kcal per gram of carbs

     // Recalculate target calories based on rounded macros to ensure consistency
     const finalTargetCalories = proteinCalories + fatCalories + safeCarbCalories;


    const calculatedGoals: NutritionData = {
      calories: Math.round(finalTargetCalories),
      proteins: proteins,
      fats: fats,
      carbs: carbs,
    };
    // --- End Calculation Logic ---

    console.log('Calculated Goals:', calculatedGoals);
    onGoalsCalculated(calculatedGoals); // Pass goals up to App
  };


  return (
    // Added container styling here for when it's the only thing shown
    <div className="container mx-auto p-4 max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">My Parameters</h1>
        {/* Pass only onSubmit to the form */}
        <MyParametersForm onSubmit={handleCalculate} />
    </div>
  );
};

export default MyParametersScreen;
