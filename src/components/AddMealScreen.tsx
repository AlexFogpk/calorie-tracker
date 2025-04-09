import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { Meal, MealCategory, MEAL_CATEGORIES, NutritionData } from '../types';
import { analyzeMeal } from '@/api/analyze-meal';
import { formatNumber } from '@/utils/formatNumber';
import { mealCacheService } from '@/services/mealCache';

interface AddMealScreenProps {
  onClose: () => void;
  onAddMeal?: (meal: NutritionData & { weight: number }) => void;
  selectedDate?: Date;
}

const AddMealScreen: React.FC<AddMealScreenProps> = ({ onClose, onAddMeal, selectedDate }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    grams: ''
  });
  const [aiGenerated, setAiGenerated] = useState(false);
  const [originalData, setOriginalData] = useState<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    grams: number;
  } | null>(null);

  const validateNumber = (value: string): number | null => {
    const num = parseFloat(value.replace(',', '.'));
    return isNaN(num) ? null : num;
  };

  const handleNumberChange = (value: string, field: keyof typeof values) => {
    // Заменяем запятую на точку
    const normalizedValue = value.replace(',', '.');
    // Проверяем, что значение соответствует формату числа
    if (/^\d*[.,]?\d*$/.test(normalizedValue)) {
      setValues(prev => ({ ...prev, [field]: normalizedValue }));

      // Если это поле веса и включен AI режим, пересчитываем значения
      if (field === 'grams' && aiGenerated && originalData) {
        const newWeight = validateNumber(normalizedValue);
        if (newWeight !== null && newWeight > 0 && originalData.grams > 0) {
          const ratio = newWeight / originalData.grams;
          const newValues = {
            calories: formatNumber(Math.round(originalData.calories * ratio)),
            protein: formatNumber(Math.round(originalData.protein * ratio)),
            fat: formatNumber(Math.round(originalData.fat * ratio)),
            carbs: formatNumber(Math.round(originalData.carbs * ratio)),
            grams: normalizedValue
          };

          console.log('Пересчет значений:', {
            исходные: originalData,
            новыйВес: newWeight,
            коэффициент: ratio,
            результат: {
              calories: Math.round(originalData.calories * ratio),
              protein: Math.round(originalData.protein * ratio),
              fat: Math.round(originalData.fat * ratio),
              carbs: Math.round(originalData.carbs * ratio)
            }
          });

          setValues(newValues);
        } else {
          console.warn('Некорректные данные для пересчета:', {
            newWeight,
            originalWeight: originalData?.grams,
            aiGenerated,
            originalData
          });
        }
      } else if (field !== 'grams' && aiGenerated) {
        // Если изменено любое другое поле, сбрасываем AI режим
        console.log('Ручное изменение значения, отключаем AI режим');
        setAiGenerated(false);
        setOriginalData(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!name.trim()) {
      setError('Введите название блюда');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeMeal(name);
      if (result.success && result.analysis) {
        const { calories, protein, fat, carbs, portion } = result.analysis;
        
        // Проверяем, что все значения корректны
        if (calories > 0 && protein >= 0 && fat >= 0 && carbs >= 0 && portion > 0) {
          const formattedValues = {
            calories: formatNumber(calories),
            protein: formatNumber(protein),
            fat: formatNumber(fat),
            carbs: formatNumber(carbs),
            grams: formatNumber(portion)
          };
          
          setValues(formattedValues);
          setOriginalData({
            calories,
            protein,
            fat,
            carbs,
            grams: portion
          });
          setAiGenerated(true);

          console.log('AI анализ завершен:', {
            исходныеЗначения: {
              calories,
              protein,
              fat,
              carbs,
              grams: portion
            }
          });
        } else {
          setError('Получены некорректные значения от AI анализа');
          console.error('Некорректные значения от AI:', {
            calories,
            protein,
            fat,
            carbs,
            portion
          });
        }
      } else {
        setError(result.error || 'Не удалось проанализировать блюдо');
        console.error('Ошибка AI анализа:', result.error);
      }
    } catch (err) {
      setError('Произошла ошибка при анализе');
      console.error('Ошибка анализа:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const calories = validateNumber(values.calories);
      const protein = validateNumber(values.protein);
      const fat = validateNumber(values.fat);
      const carbs = validateNumber(values.carbs);
      const grams = validateNumber(values.grams);

      if (calories === null || protein === null || fat === null || carbs === null || grams === null) {
        setError('Пожалуйста, введите корректные числовые значения');
        return;
      }

      if (!name.trim()) {
        setError('Введите название блюда');
        return;
      }

      if (!user) {
        setError('Пользователь не авторизован');
        return;
      }

      const mealData = {
        name: name.trim(),
        calories,
        protein,
        fat,
        carbs,
        grams,
        category,
        timestamp: selectedDate || new Date()
      };

      // Сохраняем в Firestore
      const mealRef = await addDoc(collection(db, `users/${user.uid}/meals`), mealData);

      // Add to cache using cacheMeal
      // Use the original meal description as the key
      mealCacheService.cacheMeal(name, {
        success: true, // Assuming success if we got here
        analysis: {
          calories,
          protein,
          fat,
          carbs,
          portion: 1, // Default portion?
          weight: grams // Add weight from user input
        },
        timestamp: Date.now() // Add timestamp for CachedMeal type
      });

      // Add suggestion to history if AI was used
      if (aiGenerated && originalData) {
        mealCacheService.addToHistory(name, { // Use addToHistory
          success: true,
          analysis: {
            calories: originalData.calories,
            protein: originalData.protein,
            fat: originalData.fat,
            carbs: originalData.carbs,
            portion: originalData.grams,
            weight: originalData.grams
          },
          timestamp: Date.now() // Use timestamp from originalData
        });
      }

      // Обновляем UI через onAddMeal
      if (onAddMeal) {
        onAddMeal({
          calories,
          protein,
          fat,
          carbs,
          weight: grams
        });
      }

      onClose();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Произошла ошибка при сохранении');
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
            type="button"
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
                onClick={handleAnalyze}
                disabled={isAnalyzing || !name.trim()}
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
                  {cat === 'breakfast' ? 'Завтрак' :
                   cat === 'lunch' ? 'Обед' :
                   cat === 'dinner' ? 'Ужин' :
                   cat === 'snack' ? 'Перекус' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-800 mb-1">
                Калории
              </label>
              <input
                type="text"
                id="calories"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={values.calories}
                onChange={(e) => handleNumberChange(e.target.value, 'calories')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-800 mb-1">
                Белки (г)
              </label>
              <input
                type="text"
                id="protein"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={values.protein}
                onChange={(e) => handleNumberChange(e.target.value, 'protein')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-800 mb-1">
                Жиры (г)
              </label>
              <input
                type="text"
                id="fat"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={values.fat}
                onChange={(e) => handleNumberChange(e.target.value, 'fat')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-800 mb-1">
                Углеводы (г)
              </label>
              <input
                type="text"
                id="carbs"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={values.carbs}
                onChange={(e) => handleNumberChange(e.target.value, 'carbs')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="grams" className="block text-sm font-medium text-gray-800 mb-1">
                Вес (г)
              </label>
              <input
                type="text"
                id="grams"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={values.grams}
                onChange={(e) => handleNumberChange(e.target.value, 'grams')}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Отмена
            </motion.button>
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg transition duration-150 ease-in-out flex items-center justify-center ${
                isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
            >
              {isLoading ? 'Загрузка...' : 'Добавить'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddMealScreen; 