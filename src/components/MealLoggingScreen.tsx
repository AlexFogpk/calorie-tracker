import React, { useState, useEffect } from 'react';
import { Meal, MealCategory, MEAL_CATEGORIES } from '@/types';
import MealCategorySection from './MealCategorySection';
import { AddMealForm } from './AddMealForm';
import { getDisplayDate, getTodayDateString } from '../utils/dateUtils';

interface MealLoggingScreenProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  mealsForDate: Record<MealCategory, Meal[]>;
  onAddMeal: (category: MealCategory, meal: Meal) => void;
  onEditMeal: (category: MealCategory, oldMeal: Meal, newMeal: Meal) => void;
  onDeleteMeal: (category: MealCategory, meal: Meal) => void;
}

const MealLoggingScreen: React.FC<MealLoggingScreenProps> = ({
  selectedDate,
  setSelectedDate,
  mealsForDate,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToAdd, setCategoryToAdd] = useState<MealCategory | null>(null);
  const [mealToEdit, setMealToEdit] = useState<{ meal: Meal; category: MealCategory } | null>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const openAddMealModal = (category: MealCategory) => {
    setCategoryToAdd(category);
    setMealToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditMeal = (category: MealCategory, meal: Meal) => {
    setMealToEdit({ meal, category });
    setCategoryToAdd(category);
    setIsModalOpen(true);
  };

  const handleDeleteMeal = (category: MealCategory, meal: Meal) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      onDeleteMeal(category, meal);
    }
  };

  const handleMealSubmit = (meal: Meal) => {
    if (mealToEdit) {
      onEditMeal(categoryToAdd!, mealToEdit.meal, meal);
    } else {
      onAddMeal(categoryToAdd!, meal);
    }
    setIsModalOpen(false);
    setMealToEdit(null);
    setCategoryToAdd(null);
  };

  const categories: MealCategory[] = MEAL_CATEGORIES;
  const safeMealsForDate = mealsForDate || { 'Завтрак': [], 'Обед': [], 'Ужин': [], 'Перекус': [] };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
        Log Meals for {getDisplayDate(selectedDate)}
      </h2>

      <div className="mb-4">
        <label htmlFor="mealDate" className="sr-only">Select Date</label>
        <input
          type="date"
          id="mealDate"
          value={selectedDate}
          onChange={handleDateChange}
          max={getTodayDateString()}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {categories.map(category => (
        <MealCategorySection
          key={category}
          title={category}
          meals={safeMealsForDate[category] || []}
          onAddMealClick={() => openAddMealModal(category)}
          onEditMeal={(meal) => handleEditMeal(category, meal)}
          onDeleteMeal={(meal) => handleDeleteMeal(category, meal)}
        />
      ))}

      {isModalOpen && (
        <AddMealForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleMealSubmit}
          category={categoryToAdd}
          date={getDisplayDate(selectedDate)}
          initialMeal={mealToEdit?.meal}
        />
      )}
    </div>
  );
};

export default MealLoggingScreen;
