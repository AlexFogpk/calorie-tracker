import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, orderBy, setDoc } from 'firebase/firestore';
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
import Calendar from './components/Calendar';
import { IoAddCircle } from 'react-icons/io5';
import { FiUser } from 'react-icons/fi';

type Screen = 'welcome' | 'parameters' | 'main' | 'add' | 'edit' | 'addMeal';

// Add this interface for user profile data
interface UserProfile {
  name?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'low' | 'medium' | 'high';
  goals?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
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
          const userData = userDoc.data() as UserProfile;
          setUserProfile(userData);
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

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, `users/${user.uid}/meals`),
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      setMeals(mealsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching meals:', error);
      setError('Ошибка при загрузке данных');
      setLoading(false);
    });

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

  const handleEditMeal = async (updatedMeal: Meal): Promise<void> => {
    if (!user) return;
    try {
      // Extract fields from the meal to avoid the Firestore error
      const { id, ...mealData } = updatedMeal;
      await updateDoc(doc(db, `users/${user.uid}/meals/${id}`), mealData);
      const updatedMeals = meals.map(meal => 
        meal.id === updatedMeal.id ? updatedMeal : meal
      );
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId: string): Promise<void> => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/meals/${mealId}`));
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);

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
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onComplete={handleWelcomeComplete}
        />
      )}

      {currentScreen === 'parameters' && (
        <UserParameters
          onComplete={handleParametersComplete}
        />
      )}

      {currentScreen === 'main' && (
        <>
          <div className="sticky top-0 z-10 bg-white shadow-sm pb-4">
            <div className="max-w-md mx-auto px-4 pt-4">
              <AppTitle />
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentScreen('parameters')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Настройки
                </button>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  compact
                />
                <button
                  onClick={() => setCurrentScreen('addMeal')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-md mx-auto space-y-4">
              <NutritionRings
                current={{
                  calories: totalCalories,
                  protein: totalProtein,
                  fat: totalFat,
                  carbs: totalCarbs
                }}
                goals={userProfile?.goals || {
                  calories: 2000,
                  protein: 150,
                  fat: 70,
                  carbs: 250
                }}
              />
              <DailyMealLog
                meals={meals}
                onEditMeal={handleEditMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            </div>
          </div>
        </>
      )}

      {currentScreen === 'addMeal' && (
        <AddMealScreen
          onClose={() => setCurrentScreen('main')}
          selectedDate={selectedDate}
        />
      )}

      <AnimatePresence>
        {editingMeal && (
          <EditMealScreen
            meal={editingMeal}
            onClose={() => setEditingMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;