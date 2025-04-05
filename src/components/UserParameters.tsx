import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';

// Simple function to calculate daily goals based on user parameters
const calculateDailyGoals = (params: {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'low' | 'medium' | 'high';
}) => {
  const { weight, height, age, gender, activityLevel } = params;
  
  // Base metabolic rate calculation (Harris-Benedict formula)
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity multiplier
  const activityMultiplier = 
    activityLevel === 'low' ? 1.2 :
    activityLevel === 'medium' ? 1.55 : 1.9;
  
  // Total daily energy expenditure
  const tdee = Math.round(bmr * activityMultiplier);
  
  return {
    calories: tdee,
    // Typical macronutrient splits (these can be adjusted based on goals)
    protein: Math.round(weight * 2), // 2g per kg of bodyweight
    fat: Math.round(tdee * 0.3 / 9), // 30% of calories from fat (9 cal per gram)
    carbs: Math.round(tdee * 0.5 / 4) // 50% of calories from carbs (4 cal per gram)
  };
};

interface UserParametersProps {
  onComplete: () => void;
}

const UserParameters: React.FC<UserParametersProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing user data when component mounts
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setWeight(userData.weight?.toString() || '');
          setHeight(userData.height?.toString() || '');
          setAge(userData.age?.toString() || '');
          setGender(userData.gender || 'male');
          setActivityLevel(userData.activityLevel || 'medium');
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
      const parsedWeight = parseFloat(weight);
      const parsedHeight = parseFloat(height);
      const parsedAge = parseInt(age);

      if (isNaN(parsedWeight) || isNaN(parsedHeight) || isNaN(parsedAge)) {
        throw new Error('Пожалуйста, введите корректные числовые значения.');
      }

      const goals = calculateDailyGoals({
        weight: parsedWeight,
        height: parsedHeight,
        age: parsedAge,
        gender,
        activityLevel
      });

      // Get existing data to preserve any fields we don't want to overwrite
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const existingData = userDoc.exists() ? userDoc.data() : {};

      await setDoc(doc(db, 'users', user.uid), {
        ...existingData,
        weight: parsedWeight,
        height: parsedHeight,
        age: parsedAge,
        gender,
        activityLevel,
        goals
      });

      onComplete();
    } catch (error) {
      console.error('Error saving user parameters:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при сохранении. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
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
              <label htmlFor="weight" className="block text-sm font-medium text-gray-800 mb-1">
                Вес (кг)
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-800 mb-1">
                Рост (см)
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-800 mb-1">
                Возраст
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                max="120"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-800 mb-1">
                Пол
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-800 mb-1">
              Уровень активности
            </label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
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