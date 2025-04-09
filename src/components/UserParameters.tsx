import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { calculateNutritionGoals } from '@/utils/calculateNutritionGoals';
import { UserParams, ActivityLevel, Goal } from '@/types';

interface UserParametersProps {
  onComplete: () => void;
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

const UserParameters: React.FC<UserParametersProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserParams>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderately_active',
    goal: 'maintenance'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            gender: userData.gender || 'male',
            age: userData.age || 25,
            height: userData.height || 170,
            weight: userData.weight || 70,
            activityLevel: userData.activityLevel || 'moderately_active',
            goal: userData.goal || 'maintenance'
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Ошибка при загрузке данных. Попробуйте перезагрузить страницу.');
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const goals = calculateNutritionGoals(formData);
      
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        goals
      });

      onComplete();
    } catch (error) {
      console.error('Error saving user parameters:', error);
      setError('Произошла ошибка при сохранении. Попробуйте еще раз.');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#f5f5f5] p-4"
    >
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ваши параметры</h2>
          <button
            onClick={onComplete}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-800 mb-1">
                Пол
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-800 mb-1">
                Возраст
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
                max="120"
              />
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-800 mb-1">
                Рост (см)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="100"
                max="250"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-800 mb-1">
                Вес (кг)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="30"
                max="300"
              />
            </div>

            <div>
              <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-800 mb-1">
                Уровень активности
              </label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ACTIVITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-800 mb-1">
                Цель
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UserParameters; 