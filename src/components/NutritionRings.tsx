import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/formatNumber';
import { useAuth } from '@/hooks/useAuth';

interface NutritionRingsProps {
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const NutritionRings: React.FC<NutritionRingsProps> = ({ nutrition }) => {
  const { user } = useAuth();
  const goals = user?.params?.goals || {
    calories: 2000,
    protein: 150,
    fat: 65,
    carbs: 250
  };

  const progress = {
    calories: Math.min((nutrition.calories / goals.calories) * 100, 100),
    protein: Math.min((nutrition.protein / goals.protein) * 100, 100),
    fat: Math.min((nutrition.fat / goals.fat) * 100, 100),
    carbs: Math.min((nutrition.carbs / goals.carbs) * 100, 100)
  };

  const getRingColor = (value: number) => {
    if (value >= 100) return 'text-red-500';
    if (value >= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Калории */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress.calories / 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={getRingColor(progress.calories)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">{formatNumber(nutrition.calories)}</span>
            <span className="text-xs text-gray-500">
              / {formatNumber(goals.calories)} ккал
            </span>
          </div>
        </div>
      </div>

      {/* Белки */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress.protein / 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={getRingColor(progress.protein)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">{formatNumber(nutrition.protein)}</span>
            <span className="text-xs text-gray-500">
              / {formatNumber(goals.protein)} г
            </span>
          </div>
        </div>
      </div>

      {/* Жиры */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress.fat / 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={getRingColor(progress.fat)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">{formatNumber(nutrition.fat)}</span>
            <span className="text-xs text-gray-500">
              / {formatNumber(goals.fat)} г
            </span>
          </div>
        </div>
      </div>

      {/* Углеводы */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress.carbs / 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={getRingColor(progress.carbs)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">{formatNumber(nutrition.carbs)}</span>
            <span className="text-xs text-gray-500">
              / {formatNumber(goals.carbs)} г
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionRings;
