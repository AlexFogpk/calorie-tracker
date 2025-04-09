import React from 'react';
import { motion } from 'framer-motion';
import SingleRing from './SingleRing';
import { formatNumber } from '@/utils/formatNumber';

interface NutritionRingsProps {
  current: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const NutritionRings: React.FC<NutritionRingsProps> = ({ current, goals }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 gap-4 p-4"
    >
      <SingleRing
        title="Калории"
        current={current.calories}
        goal={goals.calories}
        unit="ккал"
        color="#EF4444"
      />
      <SingleRing
        title="Белки"
        current={current.protein}
        goal={goals.protein}
        unit="г"
        color="#10B981"
      />
      <SingleRing
        title="Жиры"
        current={current.fat}
        goal={goals.fat}
        unit="г"
        color="#F59E0B"
      />
      <SingleRing
        title="Углеводы"
        current={current.carbs}
        goal={goals.carbs}
        unit="г"
        color="#3B82F6"
      />
    </motion.div>
  );
};

export default NutritionRings;
