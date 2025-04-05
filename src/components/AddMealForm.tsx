import React, { useState, useEffect } from 'react';
import { Meal, MealCategory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { analyzeMeal } from '@/api/analyze-meal';
import { IoCloseOutline } from 'react-icons/io5';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { AiOutlineRobot } from 'react-icons/ai';

interface AddMealFormProps {
  initialMeal?: Meal;
  onClose: () => void;
  userId: string | null;
}

const AddMealForm: React.FC<AddMealFormProps> = ({ initialMeal, onClose, userId }) => {
  const [entryMode, setEntryMode] = useState<'manual' | 'ai'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [meal, setMeal] = useState<Omit<Meal, 'id'>>({
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    category: 'snack',
    timestamp: Timestamp.fromDate(new Date())
  });

  useEffect(() => {
    if (initialMeal) {
      setMeal({
        name: initialMeal.name,
        calories: initialMeal.calories,
        protein: initialMeal.protein || 0,
        fat: initialMeal.fat || 0,
        carbs: initialMeal.carbs || 0,
        category: initialMeal.category || 'snack',
        timestamp: initialMeal.timestamp || Timestamp.fromDate(new Date())
      });
    }
  }, [initialMeal]);

  const validateMeal = (meal: Omit<Meal, 'id'>): boolean => {
    if (!meal.name.trim()) {
      setError('Введите название блюда');
      return false;
    }
    if (meal.calories <= 0) {
      setError('Калории должны быть больше 0');
      return false;
    }
    if (meal.protein < 0 || meal.fat < 0 || meal.carbs < 0) {
      setError('Значения БЖУ не могут быть отрицательными');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Пользователь не авторизован');
      return;
    }

    if (!validateMeal(meal)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (initialMeal?.id) {
        // Обновляем существующий прием пищи
        await updateDoc(doc(db, 'users', userId, 'meals', initialMeal.id), {
          ...meal,
          timestamp: meal.timestamp
        });
      } else {
        // Добавляем новый прием пищи
        await addDoc(collection(db, 'users', userId, 'meals'), {
          ...meal,
          timestamp: meal.timestamp
        });
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Произошла ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAiSuggestion = async () => {
    if (!aiInput.trim()) {
      setError('Пожалуйста, введите описание блюда');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const suggestion = await analyzeMeal(aiInput);
      setMeal(prev => ({
        ...prev,
        name: aiInput,
        calories: suggestion.calories,
        protein: suggestion.protein,
        fat: suggestion.fat,
        carbs: suggestion.carbs
      }));
      setEntryMode('manual');
    } catch (error) {
      console.error('Ошибка AI анализа:', error);
      setError('Произошла ошибка при анализе блюда');
    } finally {
      setIsLoading(false);
    }
  };

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
            {initialMeal ? 'Редактировать блюдо' : 'Добавить блюдо'}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Переключатель режима ввода */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            onClick={() => setEntryMode('manual')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl ${
              entryMode === 'manual'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdOutlineRestaurantMenu className="text-2xl mb-2" />
            <span>Ручной ввод</span>
          </motion.button>

          <motion.button
            onClick={() => setEntryMode('ai')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl ${
              entryMode === 'ai'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AiOutlineRobot className="text-2xl mb-2" />
            <span>AI помощник</span>
          </motion.button>
        </div>

        {/* Отображение ошибок */}
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

        {entryMode === 'ai' ? (
          <div className="space-y-4">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Опишите блюдо, например: 'Куриная грудка на гриле с рисом и овощами'"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-32 resize-none"
            />
            <motion.button
              onClick={handleGetAiSuggestion}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Анализ...
                </div>
              ) : (
                'Оценить с помощью AI'
              )}
            </motion.button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название блюда
              </label>
              <input
                type="text"
                value={meal.name}
                onChange={(e) => setMeal({ ...meal, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Калории (ккал)
              </label>
              <input
                type="number"
                value={meal.calories}
                onChange={(e) => setMeal({ ...meal, calories: Math.max(0, parseInt(e.target.value) || 0) })}
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
                value={meal.protein}
                onChange={(e) => setMeal({ ...meal, protein: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Жиры (г)
              </label>
              <input
                type="number"
                value={meal.fat}
                onChange={(e) => setMeal({ ...meal, fat: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Углеводы (г)
              </label>
              <input
                type="number"
                value={meal.carbs}
                onChange={(e) => setMeal({ ...meal, carbs: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Прием пищи
              </label>
              <select
                value={meal.category}
                onChange={(e) => setMeal({ ...meal, category: e.target.value as MealCategory })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="breakfast">Завтрак</option>
                <option value="lunch">Обед</option>
                <option value="dinner">Ужин</option>
                <option value="snack">Перекус</option>
              </select>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
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
        )}
      </div>
    </motion.div>
  );
};

export default AddMealForm;
