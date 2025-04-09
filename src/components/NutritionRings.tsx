import React from 'react';
import { formatNumber } from '@/utils/formatNumber';
import type { NutritionData } from '@/types';

interface NutritionRingsProps {
  current: NutritionData;
  goals: NutritionData;
}

const NutritionRings: React.FC<NutritionRingsProps> = ({ current, goals }) => {
  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-indigo-600"
              strokeWidth="8"
              strokeDasharray={`${calculateProgress(current.calories, goals.calories)} 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{formatNumber(current.calories)}</span>
          </div>
        </div>
        <span className="mt-2 text-sm text-gray-600">из {formatNumber(goals.calories)} ккал</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-blue-600"
              strokeWidth="8"
              strokeDasharray={`${calculateProgress(current.protein, goals.protein)} 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{formatNumber(current.protein)}</span>
          </div>
        </div>
        <span className="mt-2 text-sm text-gray-600">из {formatNumber(goals.protein)}г белка</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-yellow-600"
              strokeWidth="8"
              strokeDasharray={`${calculateProgress(current.fat, goals.fat)} 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{formatNumber(current.fat)}</span>
          </div>
        </div>
        <span className="mt-2 text-sm text-gray-600">из {formatNumber(goals.fat)}г жиров</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-green-600"
              strokeWidth="8"
              strokeDasharray={`${calculateProgress(current.carbs, goals.carbs)} 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{formatNumber(current.carbs)}</span>
          </div>
        </div>
        <span className="mt-2 text-sm text-gray-600">из {formatNumber(goals.carbs)}г углеводов</span>
      </div>
    </div>
  );
};

export default NutritionRings;
