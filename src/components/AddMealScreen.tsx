import React, { useState, useEffect } from 'react';
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

interface NutritionValues {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  grams: string;
}

const AddMealScreen: React.FC<AddMealScreenProps> = ({ onClose, selectedDate }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>(MEAL_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для текущих значений
  const [values, setValues] = useState<NutritionValues>({
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    grams: ''
  });

  // Состояние для хранения исходных значений от AI
  const [aiValues, setAiValues] = useState<NutritionValues | null>(null);

  // Функция для пересчета значений при изменении граммовки
  const recalculateValues = (newGrams: string) => {
    if (!aiValues || !newGrams || parseFloat(newGrams) === 0) return;

    const ratio = parseFloat(newGrams) / parseFloat(aiValues.grams);
    setValues({
      calories: Math.round(parseFloat(aiValues.calories) * ratio).toString(),
      protein: Math.round(parseFloat(aiValues.protein) * ratio).toString(),
      fat: Math.round(parseFloat(aiValues.fat) * ratio).toString(),
      carbs: Math.round(parseFloat(aiValues.carbs) * ratio).toString(),
      grams: newGrams
    });
  };

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
        const newValues = {
          calories: result.analysis.calories.toString(),
          protein: result.analysis.protein.toString(),
          fat: result.analysis.fat.toString(),
          carbs: result.analysis.carbs.toString(),
          grams: result.analysis.portion.toString()
        };
        
        // Сохраняем исходные значения от AI
        setAiValues(newValues);
        // Устанавливаем текущие значения
        setValues(newValues);
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
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
        calories: parseInt(values.calories) || 0,
        protein: parseInt(values.protein) || 0,
        fat: parseInt(values.fat) || 0,
        carbs: parseInt(values.carbs) || 0,
        grams: parseInt(values.grams) || 0,
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
          <h2 className="text-lg font-semibold text-gray-900">Добавить приём пищи</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
              Название блюда
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-800 mb-1">
              Категория
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MealCategory)}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MEAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="grams" className="block text-sm font-medium text-gray-800 mb-1">
              Граммы
            </label>
            <input
              type="number"
              id="grams"
              inputMode="numeric"
              value={values.grams}
              onChange={(e) => {
                const newGrams = e.target.value;
                setValues(prev => ({ ...prev, grams: newGrams }));
                if (aiValues) {
                  recalculateValues(newGrams);
                }
              }}
              onFocus={handleInputFocus}
              placeholder="0"
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-800 mb-1">
                Калории
              </label>
              <input
                type="number"
                id="calories"
                inputMode="numeric"
                value={values.calories}
                onChange={(e) => setValues(prev => ({ ...prev, calories: e.target.value }))}
                onFocus={handleInputFocus}
                placeholder="0"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-800 mb-1">
                Белки (г)
              </label>
              <input
                type="number"
                id="protein"
                inputMode="numeric"
                value={values.protein}
                onChange={(e) => setValues(prev => ({ ...prev, protein: e.target.value }))}
                onFocus={handleInputFocus}
                placeholder="0"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-800 mb-1">
                Жиры (г)
              </label>
              <input
                type="number"
                id="fat"
                inputMode="numeric"
                value={values.fat}
                onChange={(e) => setValues(prev => ({ ...prev, fat: e.target.value }))}
                onFocus={handleInputFocus}
                placeholder="0"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-800 mb-1">
                Углеводы (г)
              </label>
              <input
                type="number"
                id="carbs"
                inputMode="numeric"
                value={values.carbs}
                onChange={(e) => setValues(prev => ({ ...prev, carbs: e.target.value }))}
                onFocus={handleInputFocus}
                placeholder="0"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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