import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { Meal, MealCategory, MEAL_CATEGORIES } from '../types';
import { formatNumber } from '@/utils/formatNumber';

interface EditMealScreenProps {
  meal: Meal;
  onClose: () => void;
}

const EditMealScreen: React.FC<EditMealScreenProps> = ({ meal, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(meal.name);
  const [calories, setCalories] = useState(formatNumber(meal.calories));
  const [protein, setProtein] = useState(formatNumber(meal.protein));
  const [fat, setFat] = useState(formatNumber(meal.fat));
  const [carbs, setCarbs] = useState(formatNumber(meal.carbs));
  const [weight, setWeight] = useState(formatNumber(meal.weight));
  const [category, setCategory] = useState<MealCategory>(meal.category);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (value: string, setter: (value: string) => void) => {
    const normalizedValue = value.replace(',', '.');
    if (/^\d*[.,]?\d*$/.test(normalizedValue)) {
      setter(normalizedValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const mealRef = doc(db, `users/${user.uid}/meals`, meal.id);
      const updatedMeal = {
        name: name.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        fat: parseInt(fat) || 0,
        carbs: parseInt(carbs) || 0,
        weight: parseInt(weight) || 0,
        category,
        timestamp: meal.timestamp
      };

      await updateDoc(mealRef, updatedMeal);
      onClose();
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Произошла ошибка при обновлении. Попробуйте еще раз.');
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
          <h2 className="text-lg font-semibold text-gray-900">Редактировать приём пищи</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
              Название блюда
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-800 mb-1">
                Калории
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                id="calories"
                value={calories}
                onChange={(e) => handleNumberChange(e.target.value, setCalories)}
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
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                id="protein"
                value={protein}
                onChange={(e) => handleNumberChange(e.target.value, setProtein)}
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
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                id="fat"
                value={fat}
                onChange={(e) => handleNumberChange(e.target.value, setFat)}
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
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                id="carbs"
                value={carbs}
                onChange={(e) => handleNumberChange(e.target.value, setCarbs)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-800 mb-1">
                Вес (г)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                id="weight"
                value={weight}
                onChange={(e) => handleNumberChange(e.target.value, setWeight)}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
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

export default EditMealScreen; 