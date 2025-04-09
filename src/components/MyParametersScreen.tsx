import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserParams, ActivityLevel, Goal, NutritionData } from '@/types';
// Temporarily comment out until calculateNutritionGoals module is created
// import { calculateNutritionGoals } from '@/utils/calculateNutritionGoals'; 
import { formatNumber } from '@/utils/formatNumber';
import MyParametersForm from './MyParametersForm';

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

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Сидячий образ жизни' },
  { value: 'light', label: 'Легкая активность (1-3 раза в неделю)' },
  { value: 'moderately_active', label: 'Умеренная активность (3-5 раз в неделю)' },
  { value: 'active', label: 'Высокая активность (6-7 раз в неделю)' },
  { value: 'very_active', label: 'Очень высокая активность (2 раза в день)' }
];

const GOALS: { value: Goal; label: string }[] = [
  { value: 'weight_loss', label: 'Похудение' },
  { value: 'maintenance', label: 'Поддержание веса' },
  { value: 'muscle_gain', label: 'Набор массы' }
];

const MyParametersScreen: React.FC<MyParametersScreenProps> = ({ onGoalsCalculated }) => {
  const { user, updateUserParams } = useAuth();
  const [formData, setFormData] = useState<UserParams>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderately_active',
    goal: 'maintenance',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.params) {
      setFormData(user.params);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateUserParams(formData);
      const goals = calculateNutritionGoals(formData);
      onGoalsCalculated(goals);
    } catch (err) {
      setError('Failed to update parameters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' 
        ? Number(value) 
        : value,
    }));
  };

  const goals = calculateNutritionGoals(formData);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Parameters</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="100"
              max="250"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="30"
              max="300"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {GOALS.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Parameters'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Nutrition Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">Calories</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(goals.calories)} kcal
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">Protein</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(goals.protein)}g
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">Fat</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(goals.fat)}g
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">Carbs</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(goals.carbs)}g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyParametersScreen;
