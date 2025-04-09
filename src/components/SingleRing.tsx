import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SingleRingProps {
  title: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

const SingleRing: React.FC<SingleRingProps> = ({
  title,
  current,
  goal,
  unit,
  color
}) => {
  const percentage = useMemo(() => {
    return Math.min(100, (current / goal) * 100);
  }, [current, goal]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center p-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative w-28 h-28">
        {/* Фоновое кольцо */}
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Прогресс */}
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </svg>
        {/* Значение в центре */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <span className="text-lg font-bold text-black">{Math.round(current)}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </motion.div>
      </div>
      <div className="mt-2 text-center">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="text-xs text-gray-500">
          {Math.round(current)} / {goal} {unit}
        </p>
      </div>
    </motion.div>
  );
};

export default SingleRing;
