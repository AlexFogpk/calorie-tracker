import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { Meal, MealCategory, MEAL_CATEGORIES } from '../types';
import { analyzeFood } from '../api/analyzeFood';

interface AddMealScreenProps {
  onClose: () => void;
  selectedDate: Date;
}

const AddMealScreen: React.FC<AddMealScreenProps> = ({ onClose, selectedDate }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [category, setCategory] = useState<MealCategory>(MEAL_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAIAnalysis = async () => {
    if (!name.trim()) {
      setError('Введите название блюда для анализа');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeFood(name);
      
      if (result.success && result.analysis) {
        setCalories(result.analysis.calories.toString());
        setProtein(result.analysis.protein.toString());
        setFat(result.analysis.fat.toString());
        setCarbs(result.analysis.carbs.toString());
      } else {
        setError(result.error || 'Не удалось проанализировать блюдо');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      setError('Ошибка при анализе блюда');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const mealData: Omit<Meal, 'id'> = {
        name: name.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        fat: parseInt(fat) || 0,
        carbs: parseInt(carbs) || 0,
        category,
        timestamp: selectedDate
      };

      await addDoc(collection(db, `users/${user.uid}/meals`), mealData);
      onClose();
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Произошла ошибка при сохранении. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Добавить приём пищи</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Название блюда
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <motion.button
                type="button"
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaRobot size={20} />
                {isAnalyzing ? 'Анализ...' : 'AI анализ'}
              </motion.button>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MealCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MEAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                Калории
              </label>
              <input
                type="number"
                id="calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                Белки (г)
              </label>
              <input
                type="number"
                id="protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                Жиры (г)
              </label>
              <input
                type="number"
                id="fat"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
                Углеводы (г)
              </label>
              <input
                type="number"
                id="carbs"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
      </motion.div>
    </motion.div>
  );
};

export default AddMealScreen; 