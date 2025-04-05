import React, { useState } from 'react';
import type { Meal } from '@/types';

interface MealItemProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

const MealItem: React.FC<MealItemProps> = ({ meal, onEdit, onDelete }) => {
  const { name, calories, protein, fat, carbs } = meal;
  const [showActions, setShowActions] = useState(false);

  // Helper to format macros, showing only defined values
  const formatMacros = () => {
    const parts: string[] = [];
    if (protein !== undefined && protein >= 0) parts.push(`${Math.round(protein)}p`);
    if (fat !== undefined && fat >= 0) parts.push(`${Math.round(fat)}f`);
    if (carbs !== undefined && carbs >= 0) parts.push(`${Math.round(carbs)}c`);
    return parts.length > 0 ? `(${parts.join(' ')})` : ''; // Add parentheses
  };

  return (
    <div 
      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded mb-1 text-sm shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Meal details */}
      <div className="flex-1 min-w-0 mr-2"> {/* Allow shrinking and prevent overflow */}
        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{name}</p> {/* Truncate long names */}
        <p className="text-gray-600 dark:text-gray-400">
          {Math.round(calories)} kcal {formatMacros()}
        </p>
      </div>
      
      <div className={`flex gap-2 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onEdit(meal)}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
          title="Edit meal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(meal)}
          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
          title="Delete meal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MealItem;
