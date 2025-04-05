import React from 'react';
import { motion } from 'framer-motion';

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
      unit: 'ккал'
    },
    {
      value: protein,
      goal: goals.protein,
      label: 'белки',
      color: '#32ADE6', // Apple Blue
      name: 'protein',
      unit: 'г'
    },
    {
      value: fat,
      goal: goals.fat,
      label: 'жиры',
      color: '#AF52DE', // Apple Purple
      name: 'fat',
      unit: 'г'
    },
    {
      value: carbs,
      goal: goals.carbs,
      label: 'углеводы',
      color: '#5E5CE6', // Apple Indigo
      name: 'carbs',
      unit: 'г'
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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rings.map((ring) => {
          const progress = Math.min(100, (ring.value / ring.goal) * 100);
          const isComplete = progress >= 100;
          
          return (
            <div key={ring.name} className="flex flex-col items-center">
              <div className="relative w-[100px] h-[100px]">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={`${ring.color}20`}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </svg>
                {/* Pulsing background for completed rings */}
                {isComplete && (
                  <motion.div
                    className={`absolute inset-0 rounded-full ${ring.name === 'fat' ? 'bg-red-500' : 'bg-opacity-20'}`}
                    style={{ backgroundColor: ring.name === 'fat' ? undefined : ring.color }}
                    animate={pulseAnimation}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800">{ring.value}</span>
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
