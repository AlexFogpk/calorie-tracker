import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/formatNumber';

interface NutritionRingsProps {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const NutritionRings: React.FC<NutritionRingsProps> = ({
  calories,
  protein,
  fat,
  carbs,
  goals
}) => {
  const rings = [
    {
      value: calories,
      goal: goals.calories,
      label: 'ккал',
      color: '#FF3B30', // Apple Red
      name: 'calories',
      unit: 'ккал',
      formatted: formatNumber(calories)
    },
    {
      value: protein,
      goal: goals.protein,
      label: 'белки',
      color: '#32ADE6', // Apple Blue
      name: 'protein',
      unit: 'г',
      formatted: formatNumber(protein)
    },
    {
      value: fat,
      goal: goals.fat,
      label: 'жиры',
      color: '#AF52DE', // Apple Purple
      name: 'fat',
      unit: 'г',
      formatted: formatNumber(fat)
    },
    {
      value: carbs,
      goal: goals.carbs,
      label: 'углеводы',
      color: '#5E5CE6', // Apple Indigo
      name: 'carbs',
      unit: 'г',
      formatted: formatNumber(carbs)
    }
  ];

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {rings.map((ring) => {
          // Безопасный расчет прогресса
          const progress = ring.goal > 0 ? Math.min(100, (ring.value / ring.goal) * 100) : 0;

          return (
            <div key={ring.name} className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                {/* Фоновый круг */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-100"
                  />
                  {/* Прогресс */}
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke={ring.color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44 * progress / 100} ${2 * Math.PI * 44}`}
                    style={{
                      transition: 'stroke-dasharray 0.5s ease'
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800">{ring.formatted}</span>
                  <span className="text-xs text-gray-500">{ring.unit}</span>
                </div>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">{ring.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NutritionRings;
