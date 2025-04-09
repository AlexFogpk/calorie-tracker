import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { UserParams, ActivityLevel, Goal, NutritionData } from '@/types';
import { calculateNutritionGoals } from '@/utils/calculateNutritionGoals';
import { formatNumber } from '@/utils/formatNumber';
import MyParametersForm from './MyParametersForm';
import NutritionRings from './NutritionRings';

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

const ACTIVITY_LEVELS = [
  { value: 'sedentary', labelKey: 'settings.activity.sedentary' },
  { value: 'light', labelKey: 'settings.activity.lightly_active' },
  { value: 'moderate', labelKey: 'settings.activity.moderately_active' },
  { value: 'active', labelKey: 'settings.activity.very_active' },
  { value: 'very', labelKey: 'settings.activity.very_active' },
];

const GOALS = [
  { value: 'weight_loss', labelKey: 'settings.goal.lose_weight' },
  { value: 'maintenance', labelKey: 'settings.goal.maintenance' },
  { value: 'muscle_gain', labelKey: 'settings.goal.gain_muscle' },
];

const MyParametersScreen: React.FC<MyParametersScreenProps> = ({ onGoalsCalculated }) => {
  const { t } = useTranslation();
  const { user, updateUserParams, updateUserGoals } = useAuth();
  const [formData, setFormData] = useState<UserParams>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintenance',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedGoals, setCalculatedGoals] = useState<NutritionData | null>(null);

  useEffect(() => {
    if (user?.params) {
      setFormData(user.params);
      try {
        const initialGoals = calculateNutritionGoals(user.params);
        setCalculatedGoals(initialGoals);
        if (!user.goals) {
          updateUserGoals(initialGoals);
        }
      } catch (error) {
        console.error("Error calculating initial goals:", error);
      }
    } else if (user && !user.params) {
      setCalculatedGoals(null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateUserParams(formData);
      const goals = calculateNutritionGoals(formData);
      await updateUserGoals(goals);
      setCalculatedGoals(goals);
      onGoalsCalculated(goals);
    } catch (err) {
      setError(t('settings.error.updateFailed'));
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

  const handleCalculateGoals = async () => {
    if (formData) {
      setIsLoading(true);
      setError(null);
      try {
        const goals = calculateNutritionGoals(formData);
        await updateUserGoals(goals);
        setCalculatedGoals(goals);
      } catch (error) {
        console.error("Error calculating/saving goals:", error);
        setError('Failed to calculate or save goals.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('settings.gender')}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="male">{t('settings.gender.male')}</option>
              <option value="female">{t('settings.gender.female')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('settings.age')}</label>
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
            <label className="block text-sm font-medium text-gray-700">{t('settings.height')}</label>
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
            <label className="block text-sm font-medium text-gray-700">{t('settings.weight')}</label>
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
            <label className="block text-sm font-medium text-gray-700">{t('settings.activityLevel')}</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {t(level.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('settings.goal')}</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {GOALS.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {t(goal.labelKey)}
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
          {isLoading ? t('loading') : t('settings.save')}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('settings.goals.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">{t('settings.goals.calories')}</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(calculatedGoals?.calories || 0)} kcal
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">{t('settings.goals.protein')}</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(calculatedGoals?.protein || 0)}g
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">{t('settings.goals.fat')}</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(calculatedGoals?.fat || 0)}g
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-700">{t('settings.goals.carbs')}</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(calculatedGoals?.carbs || 0)}g
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleCalculateGoals} 
        disabled={!formData || isLoading} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {t('settings.goals.calculate')}
      </button>

      {calculatedGoals && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">{t('settings.calculatedGoals.title')}</h2>
          <NutritionRings 
            current={{ calories: 0, protein: 0, fat: 0, carbs: 0 }}
            goals={calculatedGoals} 
          />
        </div>
      )}
    </div>
  );
};

export default MyParametersScreen;
