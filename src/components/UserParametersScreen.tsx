import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { IoCloseOutline } from 'react-icons/io5';
import { UserParameters, NutritionGoals, UserParams, ActivityLevel, Goal, Gender } from '@/types';
import { calculateNutritionGoals } from '@/utils/calculateNutritionGoals';
import NutritionRings from './NutritionRings';

interface UserParametersScreenProps {
  onClose: () => void;
}

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Сидячий образ жизни' },
  { value: 'light', label: 'Легкая активность (1-3 раза в неделю)' },
  { value: 'moderate', label: 'Умеренная активность (3-5 раз в неделю)' },
  { value: 'active', label: 'Высокая активность (6-7 раз в неделю)' },
  { value: 'very', label: 'Очень высокая активность (2 раза в день)' }
];

const GOALS: { value: Goal; label: string }[] = [
  { value: 'weight_loss', label: 'Потеря веса' },
  { value: 'maintenance', label: 'Поддержание веса' },
  { value: 'muscle_gain', label: 'Набор мышечной массы' }
];

const UserParametersScreen: React.FC<UserParametersScreenProps> = ({ onClose }) => {
  const { user, updateUserParams, updateUserGoals, loading: authLoading } = useAuth();
  const [parameters, setParameters] = useState<UserParams>(user?.params || {
    gender: 'male',
  age: 30,
  height: 170,
  weight: 70,
  activityLevel: 'moderate',
    goal: 'maintenance'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedGoals, setCalculatedGoals] = useState<NutritionGoals | null>(user?.goals || null);

  useEffect(() => {
    if (user?.params) {
      setParameters(user.params);
        }
    if (user?.goals) {
      setCalculatedGoals(user.goals);
      }
  }, [user]);

  const handleCalculateGoals = () => {
    const goals = calculateNutritionGoals(parameters);
    setCalculatedGoals(goals);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateUserParams(parameters);
      
      let goalsToSave = calculatedGoals;
      if (!goalsToSave) {
        goalsToSave = calculateNutritionGoals(parameters);
        setCalculatedGoals(goalsToSave);
      }
      await updateUserGoals(goalsToSave);

      onClose();
    } catch (err) {
      console.error('Error saving parameters or goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParameters(prev => {
      const updatedParams = {
        ...prev,
        [name]: 
          name === 'gender' ? value :
          name === 'activityLevel' ? value :
          name === 'goal' ? value :
          Number(value)
      };
      setCalculatedGoals(null);
      return updatedParams;
    });
  };

  if (authLoading) {
    return <div className="p-4">Loading user data...</div>;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-[#f8f9fa] dark:bg-gray-900 z-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Мои параметры
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            <IoCloseOutline />
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Возраст
            </label>
            <input
              type="number"
              value={parameters.age}
              onChange={handleChange}
              name="age"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пол
            </label>
            <select
              value={parameters.gender}
              onChange={handleChange}
              name="gender"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Рост (см)
            </label>
            <input
              type="number"
              value={parameters.height}
              onChange={handleChange}
              name="height"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Вес (кг)
            </label>
            <input
              type="number"
              value={parameters.weight}
              onChange={handleChange}
              name="weight"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Уровень активности
            </label>
            <select
              value={parameters.activityLevel}
              onChange={handleChange}
              name="activityLevel"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Цель
            </label>
            <select
              value={parameters.goal}
              onChange={handleChange}
              name="goal"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {GOALS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleCalculateGoals}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2"
            >
              Рассчитать рекомендуемые цели
            </button>
            {calculatedGoals && (
              <div className="mt-2 p-3 bg-gray-100 rounded">
                <h3 className="text-sm font-medium text-gray-800 mb-1">Рекомендуемые цели:</h3>
                <p className="text-sm text-gray-600">Калории: {calculatedGoals.calories.toFixed(0)} ккал</p>
                <p className="text-sm text-gray-600">Белки: {calculatedGoals.protein.toFixed(0)} г</p>
                <p className="text-sm text-gray-600">Жиры: {calculatedGoals.fat.toFixed(0)} г</p>
                <p className="text-sm text-gray-600">Углеводы: {calculatedGoals.carbs.toFixed(0)} г</p>
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || authLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Сохранение...
              </div>
            ) : (
              'Сохранить'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default UserParametersScreen; 