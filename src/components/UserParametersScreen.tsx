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
  onGoalsCalculated: (goals: NutritionGoals) => void;
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

const defaultParameters: UserParameters = {
  age: 30,
  gender: 'male',
  height: 170,
  weight: 70,
  activityLevel: 'moderate',
  goal: 'maintenance',
};

const UserParametersScreen: React.FC<UserParametersScreenProps> = ({ onClose, onGoalsCalculated }) => {
  const { user, updateUserParams, params: loadedParams, loading: authLoading } = useAuth();
  const [parameters, setParameters] = useState<UserParams>(loadedParams || defaultParameters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserParameters = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setParameters(docSnap.data() as UserParams);
        }
      } catch (error) {
        console.error('Ошибка загрузки параметров:', error);
        setError('Не удалось загрузить параметры');
      } finally {
        setLoading(false);
      }
    };

    loadUserParameters();
  }, [user]);

  const validateParameters = (params: UserParams): boolean => {
    if (params.age < 0 || params.age > 150) {
      setError('Некорректный возраст');
      return false;
    }
    if (params.height < 0 || params.height > 300) {
      setError('Некорректный рост');
      return false;
    }
    if (params.weight < 0 || params.weight > 500) {
      setError('Некорректный вес');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    if (!validateParameters(parameters)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, 'users', user.uid), parameters);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения параметров:', error);
      setError('Произошла ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof UserParams | 'goal'
  ) => {
    const value = e.target.value;
    setParameters(prev => {
      if (!prev) return null;
      if (field === 'gender') {
        return { ...prev, [field]: value as Gender };
      }
      if (field === 'activityLevel') {
        return { ...prev, [field]: value as ActivityLevel };
      }
      if (field === 'goal') {
        return { ...prev, [field]: value as Goal };
      }
      if (field === 'age' || field === 'height' || field === 'weight') {
        return { ...prev, [field]: parseInt(value, 10) || 0 };
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Возраст
            </label>
            <input
              type="number"
              value={parameters.age}
              onChange={(e) => handleChange(e, 'age')}
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
              onChange={(e) => handleChange(e, 'gender')}
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
              onChange={(e) => handleChange(e, 'height')}
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
              onChange={(e) => handleChange(e, 'weight')}
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
              onChange={(e) => handleChange(e, 'activityLevel')}
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
              onChange={(e) => handleChange(e, 'goal')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {GOALS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
          >
            {saving ? (
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