import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { IoCloseOutline } from 'react-icons/io5';
import { UserParameters } from '@/types';

interface UserParametersScreenProps {
  onClose: () => void;
}

const defaultParameters: UserParameters = {
  name: '',
  age: 30,
  gender: 'male',
  height: 170,
  weight: 70,
  activityLevel: 'medium',
  goals: {
    calories: 2000,
    protein: 150,
    fat: 70,
    carbs: 250
  }
};

const UserParametersScreen: React.FC<UserParametersScreenProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [parameters, setParameters] = useState<UserParameters>(defaultParameters);
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
          setParameters(docSnap.data() as UserParameters);
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

  const validateParameters = (params: UserParameters): boolean => {
    if (!params.name.trim()) {
      setError('Введите ваше имя');
      return false;
    }
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
    if (params.goals.calories <= 0) {
      setError('Цель по калориям должна быть больше 0');
      return false;
    }
    if (params.goals.protein < 0 || params.goals.fat < 0 || params.goals.carbs < 0) {
      setError('Цели по БЖУ не могут быть отрицательными');
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
              Имя
            </label>
            <input
              type="text"
              value={parameters.name}
              onChange={(e) => setParameters({ ...parameters, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Возраст
            </label>
            <input
              type="number"
              value={parameters.age}
              onChange={(e) => setParameters({ ...parameters, age: Math.max(0, parseInt(e.target.value) || 0) })}
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
              onChange={(e) => setParameters({ ...parameters, gender: e.target.value as 'male' | 'female' })}
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
              onChange={(e) => setParameters({ ...parameters, height: Math.max(0, parseInt(e.target.value) || 0) })}
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
              onChange={(e) => setParameters({ ...parameters, weight: Math.max(0, parseInt(e.target.value) || 0) })}
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
              onChange={(e) => setParameters({ ...parameters, activityLevel: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Низкий (сидячий образ жизни)</option>
              <option value="medium">Средний (умеренные тренировки)</option>
              <option value="high">Высокий (интенсивные тренировки)</option>
            </select>
          </div>

          <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Цели питания
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Калории (ккал)
                </label>
                <input
                  type="number"
                  value={parameters.goals.calories}
                  onChange={(e) => setParameters({
                    ...parameters,
                    goals: {
                      ...parameters.goals,
                      calories: Math.max(0, parseInt(e.target.value) || 0)
                    }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Белки (г)
                </label>
                <input
                  type="number"
                  value={parameters.goals.protein}
                  onChange={(e) => setParameters({
                    ...parameters,
                    goals: {
                      ...parameters.goals,
                      protein: Math.max(0, parseInt(e.target.value) || 0)
                    }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Жиры (г)
                </label>
                <input
                  type="number"
                  value={parameters.goals.fat}
                  onChange={(e) => setParameters({
                    ...parameters,
                    goals: {
                      ...parameters.goals,
                      fat: Math.max(0, parseInt(e.target.value) || 0)
                    }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Углеводы (г)
                </label>
                <input
                  type="number"
                  value={parameters.goals.carbs}
                  onChange={(e) => setParameters({
                    ...parameters,
                    goals: {
                      ...parameters.goals,
                      carbs: Math.max(0, parseInt(e.target.value) || 0)
                    }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
              </div>
            </div>
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