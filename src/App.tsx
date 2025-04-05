import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './hooks/useAuth';
import { FaUserCog, FaUtensils } from 'react-icons/fa';
import AppTitle from './components/AppTitle';
import WelcomeScreen from './components/WelcomeScreen';
import UserParameters from './components/UserParameters';
import MainMenuScreen from './components/MainMenuScreen';
import AddMealScreen from './components/AddMealScreen';
import DailyMealLog from './components/DailyMealLog';
import DatePicker from './components/DatePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { Meal, MealCategory, MEAL_CATEGORIES, formatDate } from './types';
import NutritionRings from './components/NutritionRings';
import EditMealScreen from './components/EditMealScreen';

type Screen = 'welcome' | 'parameters' | 'main' | 'addMeal';

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [userName, setUserName] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [meals, setMeals] = useState<Record<MealCategory, Meal[]>>({
    'Завтрак': [],
    'Обед': [],
    'Ужин': [],
    'Перекус': []
  });
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }
  }, []);

  useEffect(() => {
    const checkUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || null);
          setIsNewUser(false);
          setCurrentScreen('main');
        } else {
          setIsNewUser(true);
          setCurrentScreen('welcome');
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        setError('Ошибка при загрузке данных пользователя');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkUserData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, `users/${user.uid}/meals`),
      where('timestamp', '>=', today),
      where('timestamp', '<', tomorrow)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const mealsByCategory: Record<MealCategory, Meal[]> = {
          'Завтрак': [],
          'Обед': [],
          'Ужин': [],
          'Перекус': []
        };

        snapshot.docs.forEach(doc => {
          const meal = { id: doc.id, ...doc.data() } as Meal;
          mealsByCategory[meal.category].push(meal);
        });

        setMeals(mealsByCategory);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading meals:', error);
        setError('Ошибка при загрузке приёмов пищи');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedDate]);

  const handleScreenChange = (screen: Screen) => {
    console.log('Переключение на экран:', screen);
    setCurrentScreen(screen);
  };

  const handleWelcomeComplete = () => {
    console.log('Завершение приветствия');
    handleScreenChange('parameters');
  };

  const handleParametersComplete = () => {
    console.log('Завершение настройки параметров');
    handleScreenChange('main');
  };

  const handleAddMeal = () => {
    console.log('Клик по кнопке добавления приема пищи');
    handleScreenChange('addMeal');
  };

  const handleAddMealClose = () => {
    console.log('Закрытие экрана добавления приема пищи');
    handleScreenChange('main');
  };

  const handleParametersClick = () => {
    console.log('Клик по кнопке параметров');
    handleScreenChange('parameters');
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/meals/${mealId}`));
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Ошибка при удалении приёма пищи');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-500 mb-2">Ошибка</div>
          <div className="text-gray-600">{authError || error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-2">
            Необходима авторизация
          </div>
          <div className="text-gray-600">
            Пожалуйста, подождите...
          </div>
        </div>
      </div>
    );
  }

  console.log('Текущий экран:', currentScreen);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <WelcomeScreen key="welcome" onComplete={handleWelcomeComplete} />
        )}
        {currentScreen === 'parameters' && (
          <UserParameters key="parameters" onComplete={handleParametersComplete} />
        )}
        {currentScreen === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <AppTitle />
            
            <div className="mt-8 flex justify-between items-center">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddMeal}
                className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Добавить еду
              </motion.button>
            </div>

            <div className="mt-8">
              <NutritionRings
                calories={Object.values(meals).flat().reduce((sum, meal) => sum + meal.calories, 0)}
                protein={Object.values(meals).flat().reduce((sum, meal) => sum + meal.protein, 0)}
                fat={Object.values(meals).flat().reduce((sum, meal) => sum + meal.fat, 0)}
                carbs={Object.values(meals).flat().reduce((sum, meal) => sum + meal.carbs, 0)}
                goals={{
                  calories: 2000,
                  protein: 150,
                  fat: 70,
                  carbs: 250
                }}
              />
            </div>

            <div className="mt-8 space-y-6">
              {MEAL_CATEGORIES.map(category => (
                <div key={category} className="bg-white rounded-xl shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">{category}</h2>
                  <div className="space-y-3">
                    {meals[category].map(meal => (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{meal.name}</h3>
                          <p className="text-sm text-gray-500">
                            {meal.calories} ккал • {meal.protein}г белка • {meal.fat}г жиров • {meal.carbs}г углеводов
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMeal(meal)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {meals[category].length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Нет приёмов пищи
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {currentScreen === 'addMeal' && (
          <AddMealScreen
            key="addMeal"
            onClose={handleAddMealClose}
            selectedDate={selectedDate}
          />
        )}
        {editingMeal && (
          <EditMealScreen
            key="edit-meal"
            meal={editingMeal}
            onClose={() => setEditingMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;