import React from 'react';
import { motion } from 'framer-motion';

const AppTitle: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2"
    >
      <svg
        className="w-8 h-8 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <h1 className="text-xl font-bold text-gray-800">
        AI Калькулятор Питания
      </h1>
    </motion.div>
  );
};

export default AppTitle; 