import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCog, FaUtensils } from 'react-icons/fa';
import AppTitle from './AppTitle';
import NutritionRings from './NutritionRings';
import { NutritionData, NutritionGoals } from '@/types';

interface MainMenuScreenProps {
  userName: string | null;
  userProfile: { goals: NutritionGoals };
  dailyTotals: NutritionData;
  onAddMealClick: () => void;
  onParametersClick: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  userName,
  userProfile,
  dailyTotals,
  onAddMealClick,
  onParametersClick
}) => {
  // Добавляем обработчики с логированием
  const handleAddMealClick = () => {
    console.log('Нажата кнопка добавления приема пищи');
    onAddMealClick();
  };

  const handleParametersClick = () => {
    console.log('Нажата кнопка параметров');
    onParametersClick();
  };

  return (
    <div className="relative min-h-screen bg-[#f5f5f5]">
      <div className="p-4 space-y-6">
        <AppTitle />
        
        {userName && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-lg text-gray-600">
              С возвращением, <span className="font-medium">{userName}</span>!
            </p>
          </motion.div>
        )}

        <NutritionRings 
          current={dailyTotals}
          goals={userProfile.goals}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleParametersClick}
            className="flex items-center justify-center gap-2 p-3 bg-white text-gray-700 rounded-2xl shadow-md hover:shadow-lg transition"
          >
            <FaUserCog className="w-5 h-5" />
            <span>Мои параметры</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMealClick}
            className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-2xl shadow-md hover:shadow-lg transition"
          >
            <FaUtensils className="w-5 h-5" />
            <span>Добавить прием</span>
          </motion.button>
        </div>
      </div>

      {/* Добавляем отступ снизу, чтобы контент не перекрывался кнопками */}
      <div className="h-24" />
    </div>
  );
};

export default MainMenuScreen; 