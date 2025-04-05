import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import SingleRing from './SingleRing';

interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface NutritionIntake {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

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
  const [goalsState, setGoalsState] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    fat: 70,
    carbs: 250
  });
  const [intake, setIntake] = useState<NutritionIntake>({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let unsubscribeGoals: (() => void) | undefined;
    let unsubscribeMeals: (() => void) | undefined;

    // Загружаем цели пользователя
    const loadUserGoals = () => {
      try {
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists() && doc.data().goals) {
            setGoalsState(doc.data().goals);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading user goals:', error);
        setError('Не удалось загрузить цели');
        return undefined;
      }
    };

    // Загружаем приемы пищи за сегодня
    const loadTodayMeals = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      try {
        const q = query(
          collection(db, `users/${user.uid}/meals`),
          where('timestamp', '>=', today),
          where('timestamp', '<', tomorrow)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const totalIntake = snapshot.docs.reduce((acc, doc) => {
            const meal = doc.data();
            return {
              calories: acc.calories + (meal.calories || 0),
              protein: acc.protein + (meal.protein || 0),
              fat: acc.fat + (meal.fat || 0),
              carbs: acc.carbs + (meal.carbs || 0)
            };
          }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

          setIntake(totalIntake);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading meals:', error);
        setError('Не удалось загрузить приемы пищи');
        setLoading(false);
        return undefined;
      }
    };

    unsubscribeGoals = loadUserGoals();
    unsubscribeMeals = loadTodayMeals();

    return () => {
      if (unsubscribeGoals) unsubscribeGoals();
      if (unsubscribeMeals) unsubscribeMeals();
    };
  }, [user]);

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const progress = {
    calories: calculateProgress(calories, goals.calories),
    protein: calculateProgress(protein, goals.protein),
    fat: calculateProgress(fat, goals.fat),
    carbs: calculateProgress(carbs, goals.carbs)
  };

  const getColor = (progress: number) => {
    if (progress >= 100) return '#ef4444'; // red
    if (progress >= 80) return '#f59e0b'; // yellow
    return '#22c55e'; // green
  };

  const rings = [
    {
      value: calories,
      goal: goals.calories,
      label: 'ккал',
      color: '#FF3B30', // Apple Red
      pulseColor: 'rgba(255, 59, 48, 0.3)' // Apple Red with opacity
    },
    {
      value: protein,
      goal: goals.protein,
      label: 'белки',
      color: '#32ADE6', // Apple Blue
      pulseColor: 'rgba(50, 173, 230, 0.3)'
    },
    {
      value: fat,
      goal: goals.fat,
      label: 'жиры',
      color: '#AF52DE', // Apple Purple
      pulseColor: 'rgba(175, 82, 222, 0.3)'
    },
    {
      value: carbs,
      goal: goals.carbs,
      label: 'углеводы',
      color: '#5E5CE6', // Apple Indigo
      pulseColor: 'rgba(94, 92, 230, 0.3)'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {rings.map((ring, index) => {
        const progress = calculateProgress(ring.value, ring.goal);
        const isComplete = progress >= 100;

        return (
          <div key={ring.label} className="relative w-20 h-20">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
            </svg>

            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={ring.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.26} 226`}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: progress / 100,
                  ...((isComplete && ring.label !== 'жиры') ? pulseAnimation : {})
                }}
                transition={{
                  pathLength: { duration: 1, ease: "easeOut" }
                }}
              />
            </svg>

            {/* Pulsing background for completed rings */}
            {isComplete && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: ring.pulseColor }}
                animate={pulseAnimation}
              />
            )}

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-sm font-semibold">
                  {Math.round(ring.value)}
                </div>
                <div className="text-xs text-gray-500">
                  {ring.label}
                </div>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NutritionRings;
