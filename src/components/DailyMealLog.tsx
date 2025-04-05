import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Meal, MealCategory, MEAL_CATEGORIES } from '../types';
import EditMealModal from './EditMealModal';

interface DailyMealLogProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => Promise<void>;
  onDeleteMeal: (mealId: string) => Promise<void>;
}

const DailyMealLog: React.FC<DailyMealLogProps> = ({ meals, onEditMeal, onDeleteMeal }) => {
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (meal: Meal) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      await onDeleteMeal(meal.id);
    }
  };

  const handleEditComplete = async (updatedMeal: Meal) => {
    await onEditMeal(updatedMeal);
    setIsEditModalOpen(false);
    setEditingMeal(null);
  };

  const getMealsByCategory = (category: MealCategory) => {
    return meals.filter(meal => meal.category === category);
  };

  // Calculate nutrition totals for each category
  const categoryTotals = useMemo(() => {
    return MEAL_CATEGORIES.map(category => {
      const categoryMeals = getMealsByCategory(category);
      return {
        category,
        calories: categoryMeals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: categoryMeals.reduce((sum, meal) => sum + meal.protein, 0),
        fat: categoryMeals.reduce((sum, meal) => sum + meal.fat, 0),
        carbs: categoryMeals.reduce((sum, meal) => sum + meal.carbs, 0)
      };
    });
  }, [meals]);

  return (
    <div className="space-y-4 pb-32">
      {categoryTotals.map(({ category, calories, protein, fat, carbs }) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-4"
        >
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
            {(calories > 0 || protein > 0 || fat > 0 || carbs > 0) && (
              <div className="flex items-center space-x-2 text-sm font-medium bg-gray-50 px-2 py-1 rounded-lg">
                <span className="text-red-500" title="Калории">{calories} ккал</span>
                <span className="text-gray-300">|</span>
                <span className="text-blue-500" title="Белки">{protein}г Б</span>
                <span className="text-gray-300">|</span>
                <span className="text-yellow-500" title="Жиры">{fat}г Ж</span>
                <span className="text-gray-300">|</span>
                <span className="text-green-500" title="Углеводы">{carbs}г У</span>
              </div>
            )}
          </div>
          
          <div className="min-h-[60px]">
            <AnimatePresence mode="wait">
              {getMealsByCategory(category).length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-600 text-center text-sm py-2"
                >
                  — Нет приёмов пищи —
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {getMealsByCategory(category).map(meal => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-sm text-gray-600">
                          {meal.calories} ккал • {meal.protein}г белка • {meal.fat}г жиров • {meal.carbs}г углеводов
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(meal)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(meal)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      <EditMealModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        meal={editingMeal}
        onSave={handleEditComplete}
      />
    </div>
  );
};

export default DailyMealLog; 