import React, { useState } from 'react';
import MealItem from './MealItem';
import type { Meal } from '@/types';

interface MealCategorySectionProps {
  title: string;
  meals: Meal[];
  onAddMealClick: () => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (meal: Meal) => void;
}

const MealCategorySection: React.FC<MealCategorySectionProps> = ({ 
  title, 
  meals, 
  onAddMealClick,
  onEditMeal,
  onDeleteMeal
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-150"
      >
        <div>
          <h3 className="text-lg font-semibold capitalize text-gray-800 dark:text-gray-100">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(totalCalories)} kcal</span>
        </div>
        <svg 
          className={`w-5 h-5 transform transition-transform duration-200 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Content with smooth height transition */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-3 space-y-2">
          {meals.map((meal, index) => (
            <MealItem
              key={meal.id || index}
              meal={meal}
              onEdit={onEditMeal}
              onDelete={onDeleteMeal}
            />
          ))}
          
          <button
            onClick={onAddMealClick}
            className="w-full p-2 text-sm text-indigo-600 dark:text-indigo-400 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add {title} Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealCategorySection;
